from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=100)


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    is_admin: bool = False


class UserSignupRequest(UserBase):
    password: str = Field(..., min_length=8)


class UserLogin(BaseModel):
    email_or_username: str
    password: str


class UserUpdateRequest(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = Field(None, min_length=3, max_length=100)


class UserPasswordUpdateRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)


class UserStatusUpdateRequest(BaseModel):
    is_active: bool


class UserResponse(UserBase):
    id: int
    is_admin: bool
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[int] = None
    username: Optional[str] = None


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class LoginResponse(BaseModel):
    user: UserResponse
    tokens: Token


class TokenVerifyResponse(BaseModel):
    valid: bool
    user: UserResponse


class MessageResponse(BaseModel):
    message: str


class EmailVerificationRequest(BaseModel):
    token: str


class InviteCreateRequest(BaseModel):
    email: EmailStr


class InviteResponse(BaseModel):
    id: int
    email: EmailStr
    expires_at: datetime
    invited_by_user_id: Optional[int]
    accepted_at: Optional[datetime]

    class Config:
        from_attributes = True


class InviteDetailResponse(BaseModel):
    email: EmailStr
    expires_at: datetime
    accepted: bool


class InviteAcceptRequest(BaseModel):
    token: str
    username: str = Field(..., min_length=3, max_length=100)
    password: str = Field(..., min_length=8)


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)
