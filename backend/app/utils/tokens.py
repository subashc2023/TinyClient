import hashlib
import secrets
from datetime import datetime, timedelta, timezone

DEFAULT_TOKEN_BYTES = 48


def _hash(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def generate_token_with_hash(
    expires_in: timedelta,
    token_bytes: int = DEFAULT_TOKEN_BYTES,
) -> tuple[str, str, datetime]:
    """Return a token, its SHA256 hash, and an expiry timestamp."""
    token = secrets.token_urlsafe(token_bytes)
    token_hash = _hash(token)
    expires_at = datetime.now(timezone.utc) + expires_in
    return token, token_hash, expires_at


def hash_token(token: str) -> str:
    """Return the SHA256 hash for a raw token."""
    return _hash(token)
