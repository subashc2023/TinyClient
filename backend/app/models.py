import sqlalchemy as sa
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    is_admin = Column(Boolean, default=False, nullable=False, server_default=sa.false())
    is_active = Column(Boolean, default=True, nullable=False, server_default=sa.true())
    is_verified = Column(Boolean, default=False, nullable=False, server_default=sa.false())
    # Deprecated: refresh_token stored in plaintext (kept for backward compatibility during migration)
    refresh_token = Column(Text, nullable=True)
    # New: store only refresh token hash and a version number for invalidation
    refresh_token_hash = Column(Text, nullable=True)
    token_version = Column(Integer, nullable=False, server_default=sa.text("0"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    email_verifications = relationship(
        "EmailVerification",
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    invites_sent = relationship(
        "UserInvite",
        back_populates="invited_by_user",
        foreign_keys="UserInvite.invited_by_user_id",
    )

    def __repr__(self):
        return (
            f"<User(id={self.id}, email={self.email}, username={self.username}, "
            f"is_admin={self.is_admin}, is_active={self.is_active}, is_verified={self.is_verified})>"
        )


class EmailVerification(Base):
    __tablename__ = "email_verifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    token_hash = Column(String(255), unique=True, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    used_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="email_verifications")


class UserInvite(Base):
    __tablename__ = "user_invites"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), nullable=False, unique=True)
    token_hash = Column(String(255), nullable=False, unique=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    invited_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    accepted_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    accepted_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    invited_by_user = relationship(
        "User",
        foreign_keys=[invited_by_user_id],
        back_populates="invites_sent",
    )


class PasswordReset(Base):
    __tablename__ = "password_resets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    token_hash = Column(String(255), unique=True, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    used_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")
