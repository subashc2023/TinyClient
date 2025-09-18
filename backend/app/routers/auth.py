from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from ..schemas import UserLogin, LoginResponse, Token, RefreshTokenRequest, UserResponse
from ..security import verify_password, create_token_pair, verify_token
from ..dependencies import get_current_user, security

router = APIRouter(prefix="/api/auth", tags=["authentication"])


@router.post("/login", response_model=LoginResponse)
async def login(
    user_credentials: UserLogin,
    db: Session = Depends(get_db)
):
    """
    Authenticate user with email and password.
    Returns JWT tokens and user information.
    """
    # Determine if input is email (contains @) or username
    email_or_username = user_credentials.email_or_username
    if "@" in email_or_username:
        # Search by email
        user = db.query(User).filter(User.email == email_or_username).first()
    else:
        # Search by username
        user = db.query(User).filter(User.username == email_or_username).first()

    # Verify user exists and password is correct
    if not user or not verify_password(user_credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email/username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create JWT tokens
    access_token, refresh_token = create_token_pair(user.id, user.username)

    # Update refresh token in database
    user.refresh_token = refresh_token
    db.commit()

    # Return user info and tokens
    return LoginResponse(
        user=UserResponse.from_orm(user),
        tokens=Token(
            access_token=access_token,
            refresh_token=refresh_token
        )
    )


@router.post("/refresh", response_model=Token)
async def refresh_token(
    refresh_request: RefreshTokenRequest,
    db: Session = Depends(get_db)
):
    """
    Refresh access token using refresh token.
    """
    # Verify refresh token
    payload = verify_token(refresh_request.refresh_token, expected_type="refresh")
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        user_id = int(user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Find user and verify refresh token matches
    user = db.query(User).filter(User.id == user_id).first()
    if not user or user.refresh_token != refresh_request.refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create new tokens
    access_token, new_refresh_token = create_token_pair(user.id, user.username)

    # Update refresh token in database
    user.refresh_token = new_refresh_token
    db.commit()

    return Token(
        access_token=access_token,
        refresh_token=new_refresh_token
    )


@router.post("/logout")
async def logout(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Logout user by invalidating refresh token.
    """
    # Clear refresh token
    current_user.refresh_token = None
    db.commit()

    return {"message": "Successfully logged out"}


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """
    Get current user information.
    """
    return UserResponse.from_orm(current_user)


@router.get("/verify")
async def verify_access_token(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """
    Verify access token validity.
    Returns user info if token is valid, otherwise raises 401.
    """
    token = credentials.credentials
    payload = verify_token(token, expected_type="access")

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        user_id = int(user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return {
        "valid": True,
        "user": UserResponse.from_orm(user)
    }