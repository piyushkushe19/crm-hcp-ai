"""
ORM model for the `interactions` table.
Maps to the PostgreSQL table that stores HCP interaction records.
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Enum
from sqlalchemy.sql import func
import enum

from app.db.database import Base


class InteractionType(str, enum.Enum):
    visit = "Visit"
    call = "Call"
    email = "Email"
    conference = "Conference"


class SentimentType(str, enum.Enum):
    positive = "Positive"
    neutral = "Neutral"
    negative = "Negative"


class PriorityLevel(str, enum.Enum):
    low = "Low"
    medium = "Medium"
    high = "High"


class Interaction(Base):
    __tablename__ = "interactions"

    id = Column(Integer, primary_key=True, index=True)
    hcp_name = Column(String(255), nullable=False, index=True)
    specialty = Column(String(255), nullable=True)
    hospital = Column(String(255), nullable=True, index=True)
    interaction_type = Column(String(50), nullable=False, default="Visit")
    datetime = Column(DateTime(timezone=True), nullable=True)
    summary = Column(Text, nullable=True)
    products = Column(String(500), nullable=True)    # comma-separated list
    sentiment = Column(String(50), nullable=True, default="Neutral")
    follow_up_required = Column(Boolean, default=False)
    follow_up_date = Column(DateTime(timezone=True), nullable=True)
    priority_level = Column(String(50), nullable=True, default="Medium")
    notes = Column(Text, nullable=True)
    source = Column(String(50), default="form")      # "form" | "ai_chat"
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
