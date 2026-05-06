"""
Auth router – POST /auth/login
Returns a JWT token for demo user.
"""

from fastapi import APIRouter, HTTPException, status
from app.schemas.interaction import LoginRequest, TokenResponse
from app.core.security import verify_password, create_access_token

router = APIRouter()

DEMO_USERS = {
    "admin": {
        "username": "admin",
        "full_name": "Alex Johnson",
        "role": "Field Rep",
        "avatar": "AJ",
        "hashed_password": "$2b$12$H2/lmPEa9fsvFV1b7Q0TDu0W6gFuJTZqxnTlYsP/E5ZHV7.MPZ5fS",
    }
}


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    user = DEMO_USERS.get(request.username)

    # 🔍 DEBUG BLOCK (ADD HERE)
    if user:
        print("----- LOGIN DEBUG -----")
        print("Entered password:", request.password)
        print("Stored hash:", user["hashed_password"])
        print("VERIFY RESULT:", verify_password(request.password, user["hashed_password"]))
        print("-----------------------")

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    if not verify_password(request.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    token = create_access_token(
        data={"sub": user["username"], "role": user["role"]}
    )

    return TokenResponse(
        access_token=token,
        user={
            "username": user["username"],
            "full_name": user["full_name"],
            "role": user["role"],
            "avatar": user["avatar"],
        },
    )