"""token hardening (hashed refresh + version) and password reset

Revision ID: 20250919_0003
Revises: 20250918_0002
Create Date: 2025-09-19
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "20250919_0003"
down_revision = "20250918_0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add columns for refresh token hardening
    with op.batch_alter_table("users") as batch_op:
        batch_op.add_column(sa.Column("refresh_token_hash", sa.Text(), nullable=True))
        batch_op.add_column(sa.Column("token_version", sa.Integer(), nullable=False, server_default=sa.text("0")))

    # Create password_resets table
    op.create_table(
        "password_resets",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("token_hash", sa.String(255), nullable=False, unique=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("used_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP")),
    )


def downgrade() -> None:
    op.drop_table("password_resets")
    with op.batch_alter_table("users") as batch_op:
        batch_op.drop_column("token_version")
        batch_op.drop_column("refresh_token_hash")


