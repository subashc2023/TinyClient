import os
from datetime import timedelta
from typing import List, Optional, Tuple

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..database import get_db
from ..security import get_current_admin_user, get_current_user
from ..models import EmailVerification, User, UserInvite
from ..schemas import (
    InviteCreateRequest,
    InviteResponse,
    MessageResponse,
    UserPasswordUpdateRequest,
    UserResponse,
    UserStatusUpdateRequest,
    UserUpdateRequest,
)
from ..security import hash_password, verify_password
from ..services.email import send_invite_email, send_verification_email
from ..utils.tokens import generate_token_with_hash
from ..utils.config import get_frontend_base_url
from ..utils.strings import normalize_email

router = APIRouter(prefix="/api/users", tags=["users"])

INVITE_EXPIRATION_HOURS = int(os.getenv("INVITE_EXPIRATION_HOURS", "24"))
EMAIL_VERIFICATION_EXPIRATION_HOURS = int(os.getenv("EMAIL_VERIFICATION_EXPIRATION_HOURS", "24"))


def _normalize_email(value: str) -> str:
    # Backward compatibility within this module; delegate to shared util
    return normalize_email(value)


@router.get("/", response_model=List[UserResponse])
async def list_users(
    include_inactive: bool = Query(True, description="Include users marked inactive"),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
) -> List[UserResponse]:
    query = db.query(User)
    if not include_inactive:
        query = query.filter(User.is_active.is_(True))

    users = query.order_by(User.created_at.desc()).all()
    return [UserResponse.from_orm(user) for user in users]


@router.patch("/me", response_model=UserResponse)
async def update_me(
    payload: UserUpdateRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    if payload.email is None and payload.username is None:
        return UserResponse.from_orm(current_user)

    verification_payload: Optional[Tuple[str, str]] = None

    if payload.username and payload.username.lower() != current_user.username.lower():
        username_exists = (
            db.query(User)
            .filter(func.lower(User.username) == payload.username.lower(), User.id != current_user.id)
            .first()
        )
        if username_exists:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already in use")
        current_user.username = payload.username

    if payload.email and payload.email.lower() != current_user.email.lower():
        email = _normalize_email(payload.email)
        email_exists = (
            db.query(User)
            .filter(func.lower(User.email) == email, User.id != current_user.id)
            .first()
        )
        if email_exists:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
        current_user.email = email
        current_user.is_verified = False
        current_user.refresh_token = None
        current_user.refresh_token_hash = None
        current_user.token_version = (current_user.token_version or 0) + 1

        token, token_hash, expires_at = generate_token_with_hash(
            timedelta(hours=EMAIL_VERIFICATION_EXPIRATION_HOURS)
        )
        verification = EmailVerification(
            user_id=current_user.id,
            token_hash=token_hash,
            expires_at=expires_at,
        )
        db.add(verification)
        verification_payload = (current_user.email, token)

    db.commit()
    db.refresh(current_user)

    if verification_payload:
        email, token = verification_payload
        verification_link = f"{get_frontend_base_url().rstrip('/')}/verify?token={token}"
        background_tasks.add_task(
            send_verification_email,
            email=email,
            verification_link=verification_link,
        )

    return UserResponse.from_orm(current_user)


@router.patch("/me/password", response_model=MessageResponse)
async def update_password(
    payload: UserPasswordUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MessageResponse:
    if not verify_password(payload.current_password, current_user.password_hash):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect")

    current_user.password_hash = hash_password(payload.new_password)
    current_user.refresh_token = None
    current_user.refresh_token_hash = None
    current_user.token_version = (current_user.token_version or 0) + 1
    db.commit()

    return MessageResponse(message="Password updated successfully. Please sign in again.")


@router.patch("/{user_id}/status", response_model=UserResponse)
async def update_user_status(
    user_id: int,
    payload: UserStatusUpdateRequest,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
) -> UserResponse:
    target_user = db.query(User).filter(User.id == user_id).first()
    if target_user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if target_user.id == current_admin.id and not payload.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot deactivate your own account")

    target_user.is_active = payload.is_active
    if not payload.is_active:
        target_user.refresh_token = None
        target_user.refresh_token_hash = None
        target_user.token_version = (target_user.token_version or 0) + 1

    db.commit()
    db.refresh(target_user)
    return UserResponse.from_orm(target_user)


@router.post("/invite", response_model=InviteResponse, status_code=status.HTTP_201_CREATED)
async def invite_user(
    payload: InviteCreateRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
) -> InviteResponse:
    email = _normalize_email(payload.email)

    existing_user = db.query(User).filter(func.lower(User.email) == email).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    invite = db.query(UserInvite).filter(func.lower(UserInvite.email) == email).first()

    token, token_hash, expires_at = generate_token_with_hash(timedelta(hours=INVITE_EXPIRATION_HOURS))

    if invite is None:
        invite = UserInvite(
            email=email,
            token_hash=token_hash,
            expires_at=expires_at,
            invited_by_user_id=current_admin.id,
        )
        db.add(invite)
    else:
        if invite.accepted_at is not None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invitation already accepted")
        invite.token_hash = token_hash
        invite.expires_at = expires_at
        invite.invited_by_user_id = current_admin.id
        invite.accepted_user_id = None
        invite.accepted_at = None

    db.flush()
    db.commit()
    db.refresh(invite)

    invite_link = f"{get_frontend_base_url().rstrip('/')}/invite/accept?token={token}"
    background_tasks.add_task(
        send_invite_email,
        email=invite.email,
        invite_link=invite_link,
        invited_by=current_admin.username or current_admin.email,
    )

    return InviteResponse.from_orm(invite)

