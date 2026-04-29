"""
AI Chat router – POST /ai/chat-log
Runs the HCPInteractionAgent (LangGraph) on natural language input,
returns extracted CRM fields + NBA + compliance issues.
Optionally saves the interaction to DB if save=True.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime

from app.db.database import get_db
from app.models.interaction import Interaction
from app.schemas.interaction import ChatLogRequest, ChatLogResponse, ExtractedInteraction
from app.agents.hcp_agent import run_agent
from app.core.security import get_current_user

router = APIRouter()


@router.post("/chat-log", response_model=ChatLogResponse)
async def chat_log(
    payload: ChatLogRequest,
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    """
    Run the LangGraph HCPInteractionAgent on the given natural language message.
    Returns structured CRM data extracted by the AI.
    If payload.save is True, also persists the record to the database.
    """

    if not payload.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    # ── Run LangGraph Agent ────────────────────────────────────────────────────
    try:
        agent_state = await run_agent(user_input=payload.message)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Agent error: {str(e)}",
        )

    extracted_raw = agent_state.get("extracted", {})
    compliance_issues = agent_state.get("compliance_issues", [])
    next_best_action = agent_state.get("next_best_action")

    # ── Build Response Schema ─────────────────────────────────────────────────
    extracted = ExtractedInteraction(
        hcp_name=extracted_raw.get("hcp_name"),
        hospital=extracted_raw.get("hospital"),
        specialty=extracted_raw.get("specialty"),
        interaction_type=extracted_raw.get("interaction_type", "Visit"),
        products=extracted_raw.get("products"),
        sentiment=extracted_raw.get("sentiment", "Neutral"),
        follow_up_required=extracted_raw.get("follow_up_required", False),
        follow_up_date=extracted_raw.get("follow_up_date"),
        summary=extracted_raw.get("summary"),
        priority_level=extracted_raw.get("priority_level", "Medium"),
        next_best_action=next_best_action,
        compliance_issues=compliance_issues,
        confidence=1.0,
    )

    saved_id = None

    # ── Optionally Save to DB ─────────────────────────────────────────────────
    if payload.save and extracted.hcp_name:
        follow_up_dt = None
        if extracted.follow_up_date:
            try:
                follow_up_dt = datetime.fromisoformat(extracted.follow_up_date)
            except ValueError:
                pass

        interaction = Interaction(
            hcp_name=extracted.hcp_name or "Unknown",
            hospital=extracted.hospital,
            specialty=extracted.specialty,
            interaction_type=extracted.interaction_type or "Visit",
            summary=extracted.summary,
            products=extracted.products,
            sentiment=extracted.sentiment,
            follow_up_required=extracted.follow_up_required or False,
            follow_up_date=follow_up_dt,
            priority_level=extracted.priority_level,
            notes=f"[AI Extracted] NBA: {next_best_action}" if next_best_action else None,
            source="ai_chat",
        )
        db.add(interaction)
        await db.commit()
        await db.refresh(interaction)
        saved_id = interaction.id

    return ChatLogResponse(
        extracted=extracted,
        saved_id=saved_id,
        message="Interaction extracted successfully" + (" and saved." if saved_id else "."),
    )


@router.post("/demo-tool/{tool_name}")
async def demo_tool(
    tool_name: str,
    payload: ChatLogRequest,
    _user: dict = Depends(get_current_user),
):
    """
    Demo endpoint: force a specific LangGraph tool regardless of intent.
    Useful for video demo showing all 5 tools working.
    
    tool_name options: log | edit | lookup | nba | compliance
    """
    tool_map = {
        "log": "log_interaction",
        "edit": "edit_interaction",
        "lookup": "hcp_profile_lookup",
        "nba": "next_best_action",
        "compliance": "compliance_check",
    }

    if tool_name not in tool_map:
        raise HTTPException(status_code=400, detail=f"Unknown tool. Choose from: {list(tool_map.keys())}")

    # Override intent by prepending context
    intent_prefix = {
        "log": "I met ",
        "edit": "Edit interaction: ",
        "lookup": "Show history for ",
        "nba": "What should I do next? ",
        "compliance": "Check compliance: ",
    }

    forced_input = intent_prefix[tool_name] + payload.message
    agent_state = await run_agent(user_input=forced_input)

    return {
        "tool_used": tool_map[tool_name],
        "intent_detected": agent_state.get("intent"),
        "extracted": agent_state.get("extracted"),
        "next_best_action": agent_state.get("next_best_action"),
        "compliance_issues": agent_state.get("compliance_issues"),
        "error": agent_state.get("error"),
    }
