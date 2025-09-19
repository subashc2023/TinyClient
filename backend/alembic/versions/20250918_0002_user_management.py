"""add user management tables

Revision ID: 20250918_0002
Revises: 20250918_0001
Create Date: 2025-09-18 17:45:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


author = "codex"
# revision identifiers, used by Alembic.
revision: str = "20250918_0002"
down_revision: Union[str, None] = "20250918_0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
    )
    op.add_column(
        "users",
        sa.Column("is_verified", sa.Boolean(), nullable=False, server_default=sa.false()),
    )

    op.execute(sa.text("UPDATE users SET is_active = 1, is_verified = 1"))

    op.create_table(
        "email_verifications",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("token_hash", sa.String(length=255), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("used_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_email_verifications_user_id"), "email_verifications", ["user_id"], unique=False)
    op.create_index(op.f("ix_email_verifications_token_hash"), "email_verifications", ["token_hash"], unique=True)

    op.create_table(
        "user_invites",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("token_hash", sa.String(length=255), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("invited_by_user_id", sa.Integer(), nullable=True),
        sa.Column("accepted_user_id", sa.Integer(), nullable=True),
        sa.Column("accepted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["accepted_user_id"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["invited_by_user_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_user_invites_email"), "user_invites", ["email"], unique=True)
    op.create_index(op.f("ix_user_invites_token_hash"), "user_invites", ["token_hash"], unique=True)


def downgrade() -> None:
    op.drop_index(op.f("ix_user_invites_token_hash"), table_name="user_invites")
    op.drop_index(op.f("ix_user_invites_email"), table_name="user_invites")
    op.drop_table("user_invites")

    op.drop_index(op.f("ix_email_verifications_token_hash"), table_name="email_verifications")
    op.drop_index(op.f("ix_email_verifications_user_id"), table_name="email_verifications")
    op.drop_table("email_verifications")

    op.drop_column("users", "is_verified")
    op.drop_column("users", "is_active")

