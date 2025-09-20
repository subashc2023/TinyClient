import os
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status, Response, Request
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import EmailVerification, User, UserInvite, PasswordReset
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
    PasswordResetRequest,
    PasswordResetConfirm,
)
from ..security import (
    EMAIL_NOT_VERIFIED_EXCEPTION,
    INACTIVE_ACCOUNT_EXCEPTION,
    create_token_pair,
    compute_refresh_token_hash,
    validate_password_policy,
    get_current_user,
    hash_password,
    security,
    verify_password,
    verify_token,
)
from ..services.email import send_verification_email, send_password_reset_email
from ..utils.tokens import generate_token_with_hash, hash_token
from ..utils.config import get_frontend_base_url, get_cookie_settings
from ..utils.strings import normalize_email

router = APIRouter(prefix="/api/auth", tags=["authentication"])

ALLOW_SIGNUP = os.getenv("ALLOW_SIGNUP", "false").strip().lower() in {"1", "true", "yes", "on"}
EMAIL_VERIFICATION_EXPIRATION_HOURS = int(os.getenv("EMAIL_VERIFICATION_EXPIRATION_HOURS", "24"))
PASSWORD_RESET_EXPIRATION_HOURS = int(os.getenv("PASSWORD_RESET_EXPIRATION_HOURS", "2"))


def _set_auth_cookies(response: Response, access_token: str, refresh_token: str) -> None:
    settings = get_cookie_settings()
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=settings["secure"],
        samesite=settings["samesite"],
        path=settings["path"],
        domain=settings["domain"],
    )
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=settings["secure"],
        samesite=settings["samesite"],
        path=settings["path"],
        domain=settings["domain"],
    )


def _clear_auth_cookies(response: Response) -> None:
    settings = get_cookie_settings()
    response.delete_cookie("access_token", path=settings["path"], domain=settings["domain"])
    response.delete_cookie("refresh_token", path=settings["path"], domain=settings["domain"])


def _ensure_aware(dt: datetime) -> datetime:
    """Ensure a datetime is timezone-aware (assume UTC if naive)."""
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt


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

    email = normalize_email(payload.email)

    existing_email = db.query(User).filter(func.lower(User.email) == email).first()
    if existing_email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    existing_username = db.query(User).filter(func.lower(User.username) == payload.username.lower()).first()
    if existing_username:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already in use")

    # Enforce backend password policy
    validate_password_policy(payload.password)

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
    response: Response,
    db: Session = Depends(get_db),
):
    email_or_username = user_credentials.email_or_username

    if "@" in email_or_username:
        user = db.query(User).filter(func.lower(User.email) == email_or_username.lower()).first()
    else:
        user = db.query(User).filter(func.lower(User.username) == email_or_username.lower()).first()

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

    # Store only the hash and initialize/maintain token version
    user.refresh_token_hash = compute_refresh_token_hash(refresh_token)
    user.token_version = user.token_version or 0
    db.commit()

    # Also set cookies for clients preferring cookie auth
    _set_auth_cookies(response, access_token, refresh_token)

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
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    # Prefer cookie if present for cookie-only strategy; fall back to body for tooling
    token_raw = request.cookies.get("refresh_token") or refresh_request.refresh_token
    if not token_raw:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    payload = verify_token(token_raw, expected_type="refresh")
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
    expected_hash = compute_refresh_token_hash(token_raw)
    if not user or user.refresh_token_hash != expected_hash:
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

    # Rotate hash and bump version to invalidate older chains if desired
    user.refresh_token_hash = compute_refresh_token_hash(new_refresh_token)
    user.token_version = (user.token_version or 0)
    db.commit()

    _set_auth_cookies(response, access_token, new_refresh_token)

    return Token(
        access_token=access_token,
        refresh_token=new_refresh_token,
    )


@router.post("/logout", response_model=MessageResponse)
async def logout(
    response: Response,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    current_user.refresh_token = None
    current_user.refresh_token_hash = None
    current_user.token_version = (current_user.token_version or 0) + 1
    db.commit()

    _clear_auth_cookies(response)
    return MessageResponse(message="Successfully logged out")


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user),
):
    return UserResponse.from_orm(current_user)


@router.get("/verify", response_model=TokenVerifyResponse)
async def verify_access_token(
    current_user: User = Depends(get_current_user),
):
    return TokenVerifyResponse(valid=True, user=UserResponse.from_orm(current_user))


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
    expires_at = _ensure_aware(verification.expires_at)
    if expires_at < now:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Token expired")

    user = verification.user
    user.is_verified = True

    verification.used_at = now
    db.commit()

    return MessageResponse(message="Email verified successfully. You can now log in.")


@router.post("/verify-email/resend", response_model=MessageResponse)
async def resend_verification_email(
    payload: UserLogin,  # reuse email_or_username field
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    identifier = payload.email_or_username.strip()
    if "@" in identifier:
        user = db.query(User).filter(func.lower(User.email) == identifier.lower()).first()
    else:
        user = db.query(User).filter(func.lower(User.username) == identifier.lower()).first()

    # Always return success to avoid user enumeration
    if not user:
        return MessageResponse(message="If an account exists, a verification email has been resent.")

    if user.is_verified:
        return MessageResponse(message="Your email is already verified.")

    # Create a fresh verification token
    token, token_hash, expires_at = generate_token_with_hash(
        timedelta(hours=EMAIL_VERIFICATION_EXPIRATION_HOURS)
    )
    verification = EmailVerification(
        user_id=user.id,
        token_hash=token_hash,
        expires_at=expires_at,
    )
    db.add(verification)
    db.commit()

    verification_link = f"{get_frontend_base_url().rstrip('/')}/verify?token={token}"
    background_tasks.add_task(send_verification_email, email=user.email, verification_link=verification_link)

    return MessageResponse(message="If an account exists, a verification email has been resent.")


@router.post("/password/reset", response_model=MessageResponse)
async def request_password_reset(
    payload: PasswordResetRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    email = normalize_email(payload.email)
    user = db.query(User).filter(func.lower(User.email) == email).first()

    # Do not reveal whether email exists
    if user:
        token, token_hash, expires_at = generate_token_with_hash(
            timedelta(hours=PASSWORD_RESET_EXPIRATION_HOURS)
        )
        reset = PasswordReset(
            user_id=user.id,
            token_hash=token_hash,
            expires_at=expires_at,
        )
        db.add(reset)
        db.commit()

        reset_link = f"{get_frontend_base_url().rstrip('/')}/reset?token={token}"
        background_tasks.add_task(
            send_password_reset_email,
            email=user.email,
            reset_link=reset_link,
        )

    return MessageResponse(message="If an account exists for that email, a reset link has been sent.")


@router.post("/password/reset/confirm", response_model=MessageResponse)
async def confirm_password_reset(
    payload: PasswordResetConfirm,
    db: Session = Depends(get_db),
):
    token_hash = hash_token(payload.token)
    reset = db.query(PasswordReset).filter(PasswordReset.token_hash == token_hash).first()

    if reset is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid reset token")

    if reset.used_at is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Token already used")

    now = datetime.now(timezone.utc)
    if reset.expires_at < now:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Token expired")

    user = db.query(User).filter(User.id == reset.user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Set new password and invalidate refresh tokens
    validate_password_policy(payload.new_password)
    user.password_hash = hash_password(payload.new_password)
    user.refresh_token = None
    user.refresh_token_hash = None
    user.token_version = (user.token_version or 0) + 1

    reset.used_at = now
    db.commit()

    return MessageResponse(message="Password has been reset. You can now sign in.")


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

    expires_at = _ensure_aware(invite.expires_at)
    if expires_at < now:
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
    expires_at = _ensure_aware(invite.expires_at)
    if expires_at < now:
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
        email=normalize_email(invite.email),
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


