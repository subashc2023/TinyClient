import os
import sys
from dotenv import load_dotenv
from sqlalchemy.orm import Session

from .database import SessionLocal
from .models import User
from .security import hash_password

load_dotenv()


def seed_users() -> None:
  db: Session = SessionLocal()
  try:
    admin_email = os.getenv("ADMIN_EMAIL")
    admin_username = os.getenv("ADMIN_USERNAME")
    admin_password = os.getenv("ADMIN_PASSWORD")
    user_email = os.getenv("USER_EMAIL")
    user_username = os.getenv("USER_USERNAME")
    user_password = os.getenv("USER_PASSWORD")

    if not admin_email or not admin_username or not admin_password:
      print("[ERROR] ADMIN_EMAIL, ADMIN_USERNAME and ADMIN_PASSWORD must be set in .env file")
      sys.exit(1)

    if not user_email or not user_username or not user_password:
      print("[ERROR] USER_EMAIL, USER_USERNAME and USER_PASSWORD must be set in .env file")
      sys.exit(1)

    def ensure_user(email: str, username: str, password: str, is_admin: bool) -> None:
      normalized_email = email.strip().lower()
      existing = db.query(User).filter(User.email == normalized_email).first()
      if existing:
        print(f"[INFO] User {normalized_email} already exists; skipping")
        return
      u = User(
        email=normalized_email,
        username=username,
        password_hash=hash_password(password),
        is_admin=is_admin,
        is_active=True,
        is_verified=True,
      )
      db.add(u)
      role = "admin" if is_admin else "user"
      print(f"[OK] Created {role}: {normalized_email} ({username})")

    ensure_user(admin_email, admin_username, admin_password, True)
    ensure_user(user_email, user_username, user_password, False)
    db.commit()
  except Exception as e:
    db.rollback()
    print(f"[ERROR] Seeding failed: {e}")
    sys.exit(1)
  finally:
    db.close()


def main() -> None:
  if len(sys.argv) < 2:
    print("Usage: python -m app.setup <command>")
    print("Commands:")
    print("  migrate     - Run Alembic migrations (upgrade head)")
    print("  seed        - Seed default users from env")
    print("  downgrade   - Downgrade one revision")
    sys.exit(1)

  cmd = sys.argv[1]
  if cmd == "migrate":
    os.system("alembic upgrade head")
  elif cmd == "seed":
    seed_users()
  elif cmd == "downgrade":
    os.system("alembic downgrade -1")
  else:
    print(f"Unknown command: {cmd}")
    sys.exit(1)


if __name__ == "__main__":
  main()
