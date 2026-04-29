"""
LangGraph HCP Interaction Agent
================================
Architecture:  START → detect_intent → select_tool → execute_tool → END

Five tools implemented:
  1. log_interaction_tool      – extract CRM fields from natural language
  2. edit_interaction_tool     – modify existing interaction by ID
  3. hcp_profile_lookup_tool   – retrieve doctor's interaction history
  4. next_best_action_tool     – AI-suggested follow-up recommendation
  5. compliance_checker_tool   – flag non-compliant/promotional language

Uses Groq + gemma2-9b-it (configurable via env).
"""

import json
import re
from typing import TypedDict, Annotated, List, Optional, Any
from datetime import datetime

from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.graph import StateGraph, END

from app.core.config import settings


# ── LLM Setup ─────────────────────────────────────────────────────────────────

def get_llm(model: Optional[str] = None) -> ChatGroq:
    """Return a configured Groq LLM instance."""
    return ChatGroq(
        api_key=settings.GROQ_API_KEY,
        model=model or settings.GROQ_MODEL,   # default: gemma2-9b-it
        temperature=0,
        max_tokens=1024,
    )


# ── Agent State ────────────────────────────────────────────────────────────────

class AgentState(TypedDict):
    """Shared state passed between all LangGraph nodes."""
    user_input: str                      # Raw natural language from the field rep
    intent: str                          # Detected intent (log / edit / lookup / nba / compliance)
    interaction_id: Optional[int]        # For edit operations
    extracted: dict                      # Structured CRM fields extracted by LLM
    next_best_action: Optional[str]      # Output of NBA tool
    compliance_issues: List[str]         # Flagged compliance issues
    error: Optional[str]                 # Error message if something fails
    messages: List[Any]                  # LangChain message history (for multi-turn)


# ── TOOL 1: Log Interaction ────────────────────────────────────────────────────

def log_interaction_tool(state: AgentState) -> AgentState:
    """
    Accepts natural language from a field rep and uses the LLM to extract
    structured CRM fields: HCP name, hospital, products, sentiment, follow-up.
    """
    llm = get_llm()
    system_prompt = """You are a CRM data extraction AI for pharmaceutical field representatives.

Extract the following fields from the rep's description and return ONLY valid JSON — no markdown, no backticks, no explanation.

Fields to extract:
{
  "hcp_name": "Full name of doctor/HCP or null",
  "hospital": "Hospital or clinic name or null",
  "specialty": "Medical specialty or null",
  "interaction_type": "Visit | Call | Email | Conference",
  "products": "Comma-separated product names mentioned or null",
  "sentiment": "Positive | Neutral | Negative",
  "follow_up_required": true or false,
  "follow_up_date": "ISO 8601 date string or null",
  "summary": "2-3 sentence professional summary of the interaction",
  "priority_level": "High | Medium | Low"
}

Rules:
- If follow-up is mentioned with a day like "next Tuesday", calculate ISO date from today: """ + datetime.now().strftime("%Y-%m-%d") + """
- Infer sentiment from tone words: "interested", "happy" → Positive; "concerned", "objected" → Negative
- Default interaction_type to Visit if not stated
- Return ONLY the JSON object, nothing else."""

    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=state["user_input"]),
    ]

    try:
        response = llm.invoke(messages)
        raw = response.content.strip()

        # Strip potential markdown fences (defensive)
        raw = re.sub(r"```(?:json)?", "", raw).strip().rstrip("```").strip()

        extracted = json.loads(raw)
        state["extracted"] = extracted
    except (json.JSONDecodeError, Exception) as e:
        state["error"] = f"Extraction failed: {str(e)}"
        state["extracted"] = {}

    return state


# ── TOOL 2: Edit Interaction ───────────────────────────────────────────────────

def edit_interaction_tool(state: AgentState) -> AgentState:
    """
    Takes a natural language edit request + interaction_id and extracts
    only the fields that need updating (partial update).
    """
    llm = get_llm()
    system_prompt = """You are a CRM update assistant. The user wants to edit an existing interaction record.

Extract ONLY the fields they want to change. Return valid JSON with just those fields.
Valid fields: hcp_name, hospital, specialty, interaction_type, products, sentiment,
follow_up_required, follow_up_date, summary, priority_level, notes.

Return ONLY the JSON object with changed fields. No markdown, no explanation."""

    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=f"Edit request: {state['user_input']}"),
    ]

    try:
        response = llm.invoke(messages)
        raw = response.content.strip()
        raw = re.sub(r"```(?:json)?", "", raw).strip().rstrip("```").strip()
        updates = json.loads(raw)
        state["extracted"] = updates
    except Exception as e:
        state["error"] = f"Edit extraction failed: {str(e)}"
        state["extracted"] = {}

    return state


# ── TOOL 3: HCP Profile Lookup ─────────────────────────────────────────────────

def hcp_profile_lookup_tool(state: AgentState) -> AgentState:
    """
    Summarises the interaction history of a specific HCP using the LLM.
    In production this would query the DB; here we synthesise from context.
    """
    llm = get_llm()
    # Extract doctor name first
    name_prompt = "Extract only the doctor's name from this text. Return just the name, nothing else."
    messages = [
        SystemMessage(content=name_prompt),
        HumanMessage(content=state["user_input"]),
    ]

    try:
        resp = llm.invoke(messages)
        hcp_name = resp.content.strip()

        # Simulate profile (in real app: query DB for this doctor's history)
        state["extracted"] = {
            "hcp_name": hcp_name,
            "summary": f"Profile lookup for {hcp_name}: Previous interactions pulled from DB. "
                       f"This node would query the interactions table and summarise history.",
            "lookup_performed": True,
        }
    except Exception as e:
        state["error"] = f"Profile lookup failed: {str(e)}"
        state["extracted"] = {}

    return state


# ── TOOL 4: Next Best Action ───────────────────────────────────────────────────

def next_best_action_tool(state: AgentState) -> AgentState:
    """
    Analyses the interaction context and recommends the optimal follow-up
    action for the field rep using pharmaceutical CRM best practices.
    """
    llm = get_llm()
    system_prompt = """You are an AI sales coach for a pharmaceutical company.
Based on the interaction described, recommend ONE specific next best action the field rep should take.

Be specific and actionable. Format: "[Action]: [Reason]"
Example: "Schedule follow-up call in 3 days: Dr. Sharma showed high interest in the diabetes product and requested clinical data."

Keep response under 2 sentences."""

    extracted_context = json.dumps(state.get("extracted", {})) if state.get("extracted") else state["user_input"]

    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=f"Interaction context: {extracted_context}"),
    ]

    try:
        resp = llm.invoke(messages)
        state["next_best_action"] = resp.content.strip()
    except Exception as e:
        state["error"] = f"NBA tool failed: {str(e)}"
        state["next_best_action"] = None

    return state


# ── TOOL 5: Compliance Checker ─────────────────────────────────────────────────

def compliance_checker_tool(state: AgentState) -> AgentState:
    """
    Scans the interaction text for promotional or non-compliant language.
    Flags any statements that could violate pharma industry regulations (e.g., DCGI, PhRMA).
    """
    llm = get_llm()
    system_prompt = """You are a pharmaceutical compliance officer AI.

Scan the following interaction note for compliance issues such as:
- Off-label drug promotion
- Exaggerated efficacy claims ("guaranteed to cure", "best drug ever")
- Comparative superiority claims without trial data
- Patient privacy violations
- Gift/incentive mentions that violate anti-bribery rules

Return a JSON array of issues found. Each issue: {"issue": "description", "severity": "High|Medium|Low"}
If no issues: return []
Return ONLY valid JSON, no markdown."""

    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=state["user_input"]),
    ]

    try:
        resp = llm.invoke(messages)
        raw = resp.content.strip()
        raw = re.sub(r"```(?:json)?", "", raw).strip().rstrip("```").strip()
        issues = json.loads(raw)
        state["compliance_issues"] = [i.get("issue", str(i)) for i in issues] if isinstance(issues, list) else []
    except Exception as e:
        state["error"] = f"Compliance check failed: {str(e)}"
        state["compliance_issues"] = []

    return state


# ── Intent Detection ───────────────────────────────────────────────────────────

def detect_intent_node(state: AgentState) -> AgentState:
    """
    Uses the LLM to classify the user's intent into one of 5 categories.
    This drives which tool is selected next.
    """
    llm = get_llm()
    system_prompt = """Classify the user's intent. Return ONLY one of these exact strings:
log_interaction | edit_interaction | hcp_profile_lookup | next_best_action | compliance_check

Rules:
- "I met / visited / called / emailed Dr." → log_interaction
- "update / change / edit interaction" → edit_interaction
- "history / profile / previous interactions" → hcp_profile_lookup
- "what should I do / next step / recommend" → next_best_action
- "check compliance / is this okay / review language" → compliance_check

Default: log_interaction"""

    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=state["user_input"]),
    ]

    try:
        resp = llm.invoke(messages)
        intent = resp.content.strip().lower()
        # Validate intent
        valid = {"log_interaction", "edit_interaction", "hcp_profile_lookup", "next_best_action", "compliance_check"}
        state["intent"] = intent if intent in valid else "log_interaction"
    except Exception:
        state["intent"] = "log_interaction"

    return state


def route_to_tool(state: AgentState) -> str:
    """Conditional edge: routes to the correct tool node based on detected intent."""
    return state.get("intent", "log_interaction")


# ── Build LangGraph ────────────────────────────────────────────────────────────

def build_agent() -> Any:
    """Constructs and compiles the HCPInteractionAgent graph."""

    workflow = StateGraph(AgentState)

    # Add nodes
    workflow.add_node("detect_intent", detect_intent_node)
    workflow.add_node("log_interaction", log_interaction_tool)
    workflow.add_node("edit_interaction", edit_interaction_tool)
    workflow.add_node("hcp_profile_lookup", hcp_profile_lookup_tool)
    workflow.add_node("next_best_action", next_best_action_tool)
    workflow.add_node("compliance_check", compliance_checker_tool)

    # Entry point
    workflow.set_entry_point("detect_intent")

    # Conditional routing after intent detection
    workflow.add_conditional_edges(
        "detect_intent",
        route_to_tool,
        {
            "log_interaction": "log_interaction",
            "edit_interaction": "edit_interaction",
            "hcp_profile_lookup": "hcp_profile_lookup",
            "next_best_action": "next_best_action",
            "compliance_check": "compliance_check",
        },
    )

    # After each tool → END (can chain NBA + Compliance in full pipeline)
    for node in ["log_interaction", "edit_interaction", "hcp_profile_lookup",
                 "next_best_action", "compliance_check"]:
        workflow.add_edge(node, END)

    return workflow.compile()


# Singleton agent instance (compiled once, reused across requests)
hcp_agent = build_agent()


async def run_agent(user_input: str, interaction_id: Optional[int] = None) -> AgentState:
    """
    Public interface: run the HCPInteractionAgent with given input.
    Returns the final state including extracted data, NBA, and compliance issues.
    """
    initial_state: AgentState = {
        "user_input": user_input,
        "intent": "",
        "interaction_id": interaction_id,
        "extracted": {},
        "next_best_action": None,
        "compliance_issues": [],
        "error": None,
        "messages": [],
    }

    # LangGraph invoke is sync; wrap in thread for async FastAPI compatibility
    import asyncio
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(None, hcp_agent.invoke, initial_state)
    return result
