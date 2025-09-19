import os
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import EmailVerification, User, UserInvite
from ..schemas import (
    EmailVerificationRequest,
    InviteAcceptRequest,
    InviteDetailResponse,
    LoginResponse,
    MessageResponse,
    RefreshTokenRequest,
    Token,
    TokenVerifyResponse,
    UserLogin,
    UserResponse,
    UserSignupRequest,
)
from ..security import (
    EMAIL_NOT_VERIFIED_EXCEPTION,
    INACTIVE_ACCOUNT_EXCEPTION,
    create_token_pair,
    get_current_user,
    hash_password,
    security,
    verify_password,
    verify_token,
)
from ..services.email import send_verification_email
from ..utils.tokens import generate_token_with_hash, hash_token
from ..utils.config import get_frontend_base_url

router = APIRouter(prefix="/api/auth", tags=["authentication"])

ALLOW_SIGNUP = os.getenv("ALLOW_SIGNUP", "false").strip().lower() in {"1", "true", "yes", "on"}
EMAIL_VERIFICATION_EXPIRATION_HOURS = int(os.getenv("EMAIL_VERIFICATION_EXPIRATION_HOURS", "24"))


def _normalize_email(value: str) -> str:
    return value.strip().lower()


@router.post("/signup", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def signup(
    payload: UserSignupRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    if not ALLOW_SIGNUP:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Self-serve signup is disabled. Please contact an administrator for access.",
        )

    email = _normalize_email(payload.email)

    existing_email = db.query(User).filter(func.lower(User.email) == email).first()
    if existing_email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    existing_username = db.query(User).filter(func.lower(User.username) == payload.username.lower()).first()
    if existing_username:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already in use")

    new_user = User(
        email=email,
        username=payload.username,
        password_hash=hash_password(payload.password),
        is_admin=False,
        is_active=True,
        is_verified=False,
    )
    db.add(new_user)
    db.flush()

    token, token_hash, expires_at = generate_token_with_hash(
        timedelta(hours=EMAIL_VERIFICATION_EXPIRATION_HOURS)
    )
    verification = EmailVerification(
        user_id=new_user.id,
        token_hash=token_hash,
        expires_at=expires_at,
    )
    db.add(verification)
    db.commit()

    verification_link = f"{get_frontend_base_url().rstrip('/')}/verify?token={token}"
    background_tasks.add_task(send_verification_email, email=new_user.email, verification_link=verification_link)

    return MessageResponse(message="Signup successful. Check your email to verify your account.")


@router.post("/login", response_model=LoginResponse)
async def login(
    user_credentials: UserLogin,
    db: Session = Depends(get_db),
):
    email_or_username = user_credentials.email_or_username
    print(f"🔍 Login attempt for: '{email_or_username}'")

    if "@" in email_or_username:
        print(f"🔍 Searching by email: '{email_or_username.lower()}'")
        user = db.query(User).filter(func.lower(User.email) == email_or_username.lower()).first()
    else:
        print(f"🔍 Searching by username: '{email_or_username.lower()}'")
        user = db.query(User).filter(func.lower(User.username) == email_or_username.lower()).first()

    print(f"🔍 User found: {user is not None}")
    if user:
        print(f"🔍 User details: email={user.email}, username={user.username}, active={user.is_active}, verified={user.is_verified}")

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not verify_password(user_credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise INACTIVE_ACCOUNT_EXCEPTION

    if not user.is_verified:
        raise EMAIL_NOT_VERIFIED_EXCEPTION

    access_token, refresh_token = create_token_pair(user.id, user.username)

    user.refresh_token = refresh_token
    db.commit()

    return LoginResponse(
        user=UserResponse.from_orm(user),
        tokens=Token(
            access_token=access_token,
            refresh_token=refresh_token,
        ),
    )


@router.post("/refresh", response_model=Token)
async def refresh_token(
    refresh_request: RefreshTokenRequest,
    db: Session = Depends(get_db),
):
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

    user = db.query(User).filter(User.id == user_id).first()
    if not user or user.refresh_token != refresh_request.refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise INACTIVE_ACCOUNT_EXCEPTION

    if not user.is_verified:
        raise EMAIL_NOT_VERIFIED_EXCEPTION

    access_token, new_refresh_token = create_token_pair(user.id, user.username)

    user.refresh_token = new_refresh_token
    db.commit()

    return Token(
        access_token=access_token,
        refresh_token=new_refresh_token,
    )


@router.post("/logout", response_model=MessageResponse)
async def logout(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    current_user.refresh_token = None
    db.commit()

    return MessageResponse(message="Successfully logged out")


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user),
):
    return UserResponse.from_orm(current_user)


@router.get("/verify", response_model=TokenVerifyResponse)
async def verify_access_token(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
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

    if not user.is_active:
        raise INACTIVE_ACCOUNT_EXCEPTION

    if not user.is_verified:
        raise EMAIL_NOT_VERIFIED_EXCEPTION

    return TokenVerifyResponse(valid=True, user=UserResponse.from_orm(user))


@router.post("/verify-email", response_model=MessageResponse)
async def verify_email(
    payload: EmailVerificationRequest,
    db: Session = Depends(get_db),
):
    token_hash = hash_token(payload.token)
    verification = (
        db.query(EmailVerification)
        .filter(EmailVerification.token_hash == token_hash)
        .first()
    )

    if verification is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid verification token")

    if verification.used_at is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Token already used")

    now = datetime.now(timezone.utc)
    if verification.expires_at < now:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Token expired")

    user = verification.user
    user.is_verified = True

    verification.used_at = now
    db.commit()

    return MessageResponse(message="Email verified successfully. You can now log in.")


@router.get("/invite/{token}", response_model=InviteDetailResponse)
async def get_invite_details(
    token: str,
    db: Session = Depends(get_db),
):
    token_hash = hash_token(token)
    invite = (
        db.query(UserInvite)
        .filter(UserInvite.token_hash == token_hash)
        .first()
    )

    if invite is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invitation not found")

    now = datetime.now(timezone.utc)

    if invite.accepted_at is not None:
        raise HTTPException(status_code=status.HTTP_410_GONE, detail="Invitation already accepted")

    if invite.expires_at < now:
        raise HTTPException(status_code=status.HTTP_410_GONE, detail="Invitation expired")

    return InviteDetailResponse(
        email=invite.email,
        expires_at=invite.expires_at,
        accepted=False,
    )


@router.post("/invite/accept", response_model=MessageResponse)
async def accept_invite(
    payload: InviteAcceptRequest,
    db: Session = Depends(get_db),
):
    token_hash = hash_token(payload.token)
    invite = (
        db.query(UserInvite)
        .filter(UserInvite.token_hash == token_hash)
        .first()
    )

    if invite is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid invitation token")

    if invite.accepted_at is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invitation already accepted")

    now = datetime.now(timezone.utc)
    if invite.expires_at < now:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invitation expired")

    existing_user = db.query(User).filter(func.lower(User.email) == invite.email.lower()).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    username_collision = (
        db.query(User)
        .filter(func.lower(User.username) == payload.username.lower())
        .first()
    )
    if username_collision:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already in use")

    new_user = User(
        email=_normalize_email(invite.email),
        username=payload.username,
        password_hash=hash_password(payload.password),
        is_admin=False,
        is_active=True,
        is_verified=True,
    )
    db.add(new_user)
    db.flush()

    invite.accepted_user_id = new_user.id
    invite.accepted_at = now

    db.commit()

    return MessageResponse(message="Invitation accepted. You can now sign in.")


