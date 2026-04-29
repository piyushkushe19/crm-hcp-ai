"""
Auth router – POST /auth/login
Returns a JWT token for demo user (no DB user table to keep scope focused).
In production, validate against a users table.
"""

from fastapi import APIRouter, HTTPException, status
from app.schemas.interaction import LoginRequest, TokenResponse
from app.core.security import hash_password, verify_password, create_access_token

router = APIRouter()

# Demo users (in production → query users table)
DEMO_USERS = {
    "admin": {
        "username": "admin",
        "full_name": "Alex Johnson",
        "role": "Field Rep",
        "avatar": "AJ",
        "hashed_password": hash_password("password123"),
    }
}


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    """Authenticate user and return JWT access token."""
    user = DEMO_USERS.get(request.username)

    if not user or not verify_password(request.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    token = create_access_token(data={"sub": user["username"], "role": user["role"]})

    return TokenResponse(
        access_token=token,
        user={
            "username": user["username"],
            "full_name": user["full_name"],
            "role": user["role"],
            "avatar": user["avatar"],
        },
    )
