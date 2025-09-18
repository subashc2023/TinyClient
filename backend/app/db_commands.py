import os
import sys
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from .database import SessionLocal, create_database, drop_database
from .models import User
from .security import hash_password

load_dotenv()


def init_database():
    """Initialize the database by creating all tables"""
    print("Creating database tables...")
    try:
        create_database()
        print("[OK] Database tables created successfully!")
    except Exception as e:
        print(f"[ERROR] Error creating database tables: {e}")
        sys.exit(1)


def seed_database():
    """Seed the database with initial users from environment variables"""
    print("Seeding database with initial users...")

    db = SessionLocal()
    try:
        # Get user data from environment variables
        admin_email = os.getenv("ADMIN_EMAIL")
        admin_username = os.getenv("ADMIN_USERNAME")
        admin_password = os.getenv("ADMIN_PASSWORD")
        user_email = os.getenv("USER_EMAIL")
        user_username = os.getenv("USER_USERNAME")
        user_password = os.getenv("USER_PASSWORD")

        if not admin_email or not admin_username or not admin_password:
            print("[ERROR] ADMIN_EMAIL, ADMIN_USERNAME and ADMIN_PASSWORD must be set in .env file")
            return

        if not user_email or not user_username or not user_password:
            print("[ERROR] USER_EMAIL, USER_USERNAME and USER_PASSWORD must be set in .env file")
            return

        # Check if admin user already exists
        existing_admin = db.query(User).filter(User.email == admin_email).first()
        if existing_admin:
            print(f"[WARN] Admin user with email {admin_email} already exists, skipping...")
        else:
            # Create admin user
            admin_user = User(
                email=admin_email,
                username=admin_username,
                password_hash=hash_password(admin_password),
                is_admin=True
            )
            db.add(admin_user)
            print(f"[OK] Created admin user: {admin_email} ({admin_username})")

        # Check if regular user already exists
        existing_user = db.query(User).filter(User.email == user_email).first()
        if existing_user:
            print(f"[WARN] User with email {user_email} already exists, skipping...")
        else:
            # Create regular user
            regular_user = User(
                email=user_email,
                username=user_username,
                password_hash=hash_password(user_password),
                is_admin=False
            )
            db.add(regular_user)
            print(f"[OK] Created regular user: {user_email} ({user_username})")

        db.commit()
        print("[OK] Database seeding completed successfully!")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error seeding database: {e}")
        sys.exit(1)
    finally:
        db.close()


def reset_database():
    """Drop and recreate all database tables (WARNING: This will delete all data!)"""
    print("[WARN] WARNING: This will delete all data in the database!")
    confirm = input("Are you sure you want to continue? (yes/no): ").lower().strip()

    if confirm != "yes":
        print("[INFO] Operation cancelled.")
        return

    print("Dropping database tables...")
    try:
        drop_database()
        print("[OK] Database tables dropped successfully!")

        print("Recreating database tables...")
        create_database()
        print("[OK] Database tables recreated successfully!")

        print("Seeding database with initial data...")
        seed_database()

    except Exception as e:
        print(f"[ERROR] Error resetting database: {e}")
        sys.exit(1)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python -m app.db_commands <command>")
        print("Available commands:")
        print("  init   - Create database tables")
        print("  seed   - Seed database with initial users")
        print("  reset  - Drop and recreate all tables (WARNING: Deletes all data!)")
        sys.exit(1)

    command = sys.argv[1].lower()

    if command == "init":
        init_database()
    elif command == "seed":
        seed_database()
    elif command == "reset":
        reset_database()
    else:
        print(f"[ERROR] Unknown command: {command}")
        print("Available commands: init, seed, reset")
        sys.exit(1)