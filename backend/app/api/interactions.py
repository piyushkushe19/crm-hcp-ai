"""
Interactions router – full CRUD operations.
  GET    /interactions          - List all interactions
  POST   /interactions/log      - Create new interaction
  PUT    /interactions/edit/{id}- Update existing
  DELETE /interactions/{id}     - Delete interaction
  POST   /interactions/seed     - Load sample data (demo)
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from typing import List
from datetime import datetime, timedelta

from app.db.database import get_db
from app.models.interaction import Interaction
from app.schemas.interaction import InteractionCreate, InteractionUpdate, InteractionResponse
from app.core.security import get_current_user

router = APIRouter()


# ── CREATE ─────────────────────────────────────────────────────────────────────

@router.post("/log", response_model=InteractionResponse, status_code=status.HTTP_201_CREATED)
async def log_interaction(
    payload: InteractionCreate,
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    """Save a new HCP interaction (from structured form or AI chat)."""
    interaction = Interaction(**payload.model_dump())
    db.add(interaction)
    await db.commit()
    await db.refresh(interaction)
    return interaction


# ── READ ALL ───────────────────────────────────────────────────────────────────

@router.get("", response_model=List[InteractionResponse])
async def list_interactions(
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    """Return all interactions ordered by creation date (newest first)."""
    result = await db.execute(
        select(Interaction).order_by(Interaction.created_at.desc())
    )
    return result.scalars().all()


# ── UPDATE ─────────────────────────────────────────────────────────────────────

@router.put("/edit/{interaction_id}", response_model=InteractionResponse)
async def edit_interaction(
    interaction_id: int,
    payload: InteractionUpdate,
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    """Partially update an existing interaction."""
    result = await db.execute(select(Interaction).where(Interaction.id == interaction_id))
    interaction = result.scalar_one_or_none()

    if not interaction:
        raise HTTPException(status_code=404, detail="Interaction not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(interaction, field, value)

    await db.commit()
    await db.refresh(interaction)
    return interaction


# ── DELETE ─────────────────────────────────────────────────────────────────────

@router.delete("/{interaction_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_interaction(
    interaction_id: int,
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    """Delete an interaction by ID."""
    result = await db.execute(select(Interaction).where(Interaction.id == interaction_id))
    interaction = result.scalar_one_or_none()

    if not interaction:
        raise HTTPException(status_code=404, detail="Interaction not found")

    await db.delete(interaction)
    await db.commit()


# ── SEED DATA ──────────────────────────────────────────────────────────────────

@router.post("/seed", status_code=status.HTTP_201_CREATED)
async def seed_interactions(
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    """Load sample HCP interactions for demo/video purposes."""
    now = datetime.utcnow()
    sample_data = [
        {
            "hcp_name": "Dr. Rahul Sharma",
            "specialty": "Diabetology",
            "hospital": "Apollo Hospital, Mumbai",
            "interaction_type": "Visit",
            "datetime": now - timedelta(days=2),
            "summary": "Discussed Metformin XR launch. Dr. Sharma showed strong interest. Requested clinical trial data and pricing sheet. Positive reception overall.",
            "products": "Metformin XR, GlucoShield",
            "sentiment": "Positive",
            "follow_up_required": True,
            "follow_up_date": now + timedelta(days=5),
            "priority_level": "High",
            "notes": "Prefers morning visits. Decision maker for the department.",
            "source": "form",
        },
        {
            "hcp_name": "Dr. Priya Nair",
            "specialty": "Cardiology",
            "hospital": "Fortis Hospital, Pune",
            "interaction_type": "Call",
            "datetime": now - timedelta(days=1),
            "summary": "Phone call regarding Atorvastatin 40mg sample request. Agreed to prescribe pending availability confirmation.",
            "products": "Atorvastatin 40mg",
            "sentiment": "Neutral",
            "follow_up_required": True,
            "follow_up_date": now + timedelta(days=3),
            "priority_level": "Medium",
            "notes": "Needs sample courier by Friday.",
            "source": "ai_chat",
        },
        {
            "hcp_name": "Dr. Vikram Patel",
            "specialty": "Oncology",
            "hospital": "Tata Memorial Centre, Mumbai",
            "interaction_type": "Conference",
            "datetime": now - timedelta(days=7),
            "summary": "Met at Mumbai Oncology Summit. Discussed targeted therapy pipeline. Expressed concerns about side-effect profile of new compound.",
            "products": "OncoPrime, TargetoMax",
            "sentiment": "Negative",
            "follow_up_required": False,
            "follow_up_date": None,
            "priority_level": "Low",
            "notes": "Research-focused; not currently prescribing. Re-engage in 3 months.",
            "source": "form",
        },
        {
            "hcp_name": "Dr. Anjali Mehta",
            "specialty": "Psychiatry",
            "hospital": "NIMHANS Bangalore",
            "interaction_type": "Email",
            "datetime": now - timedelta(hours=5),
            "summary": "Sent follow-up email with Escitalopram dosage guidelines and published RCT paper. Awaiting response.",
            "products": "Escitalopram 10mg",
            "sentiment": "Neutral",
            "follow_up_required": True,
            "follow_up_date": now + timedelta(days=7),
            "priority_level": "Medium",
            "notes": "Email preferred communication mode.",
            "source": "form",
        },
        {
            "hcp_name": "Dr. Suresh Kumar",
            "specialty": "Nephrology",
            "hospital": "Manipal Hospital, Bangalore",
            "interaction_type": "Visit",
            "datetime": now - timedelta(days=4),
            "summary": "Productive visit. Dr. Kumar is actively prescribing NephroGuard. Requested additional samples and patient education brochures.",
            "products": "NephroGuard, HydroBalance",
            "sentiment": "Positive",
            "follow_up_required": True,
            "follow_up_date": now + timedelta(days=14),
            "priority_level": "High",
            "notes": "Top prescriber in the region. VIP relationship.",
            "source": "ai_chat",
        },
    ]

    for data in sample_data:
        interaction = Interaction(**data)
        db.add(interaction)

    await db.commit()
    return {"message": f"Seeded {len(sample_data)} sample interactions", "count": len(sample_data)}
