"""
Pydantic schemas for Interactions API.
Separate schemas for create, update, and response to follow best practices.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class InteractionCreate(BaseModel):
    hcp_name: str = Field(..., min_length=1, max_length=255, description="Doctor / HCP full name")
    specialty: Optional[str] = None
    hospital: Optional[str] = None
    interaction_type: str = "Visit"
    datetime: Optional[datetime] = None
    summary: Optional[str] = None
    products: Optional[str] = None          # comma-separated
    sentiment: Optional[str] = "Neutral"
    follow_up_required: bool = False
    follow_up_date: Optional[datetime] = None
    priority_level: Optional[str] = "Medium"
    notes: Optional[str] = None
    source: Optional[str] = "form"


class InteractionUpdate(BaseModel):
    hcp_name: Optional[str] = None
    specialty: Optional[str] = None
    hospital: Optional[str] = None
    interaction_type: Optional[str] = None
    datetime: Optional[datetime] = None
    summary: Optional[str] = None
    products: Optional[str] = None
    sentiment: Optional[str] = None
    follow_up_required: Optional[bool] = None
    follow_up_date: Optional[datetime] = None
    priority_level: Optional[str] = None
    notes: Optional[str] = None


class InteractionResponse(BaseModel):
    id: int
    hcp_name: str
    specialty: Optional[str]
    hospital: Optional[str]
    interaction_type: str
    datetime: Optional[datetime]
    summary: Optional[str]
    products: Optional[str]
    sentiment: Optional[str]
    follow_up_required: bool
    follow_up_date: Optional[datetime]
    priority_level: Optional[str]
    notes: Optional[str]
    source: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]

    model_config = {"from_attributes": True}


# ── Auth Schemas ───────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


# ── AI Chat Schemas ────────────────────────────────────────────────────────────

class ChatLogRequest(BaseModel):
    message: str = Field(..., min_length=5, description="Natural language interaction description")
    save: bool = False                                  # If True, persist to DB after extraction


class ExtractedInteraction(BaseModel):
    """Structured output extracted by the LangGraph agent."""
    hcp_name: Optional[str] = None
    hospital: Optional[str] = None
    specialty: Optional[str] = None
    interaction_type: Optional[str] = "Visit"
    products: Optional[str] = None
    sentiment: Optional[str] = "Neutral"
    follow_up_required: Optional[bool] = False
    follow_up_date: Optional[str] = None
    summary: Optional[str] = None
    priority_level: Optional[str] = "Medium"
    next_best_action: Optional[str] = None
    compliance_issues: Optional[List[str]] = []
    confidence: Optional[float] = 1.0


class ChatLogResponse(BaseModel):
    extracted: ExtractedInteraction
    saved_id: Optional[int] = None
    message: str
