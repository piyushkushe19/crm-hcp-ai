"""
CRM HCP AI - FastAPI Application Entry Point
Handles CORS, router registration, and startup events.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.db.database import create_tables
from app.api import auth, interactions, ai_chat


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_tables()
    yield


app = FastAPI(
    title="CRM HCP AI API",
    description="AI-First CRM for Healthcare Professionals",
    version="1.0.0",
    lifespan=lifespan,
)

# ✅ Correct CORS (NO custom middleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",  # ✅ your frontend
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(interactions.router, prefix="/interactions", tags=["Interactions"])
app.include_router(ai_chat.router, prefix="/ai", tags=["AI Chat"])


@app.get("/health")
async def health():
    return {"status": "ok"}