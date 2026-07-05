"""
Purpose: Password hashing and verification service.
Responsibilities:
  - Hashes plain text passwords using bcrypt.
  - Verifies passwords against hashed values securely.
Architecture Fit:
  - Reusable utility called by the authentication business logic.
"""

from passlib.context import CryptContext

# Define the password hashing context using bcrypt.
# Schemes can be expanded if backward compatibility with older hashes is needed.
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies that a plain text password matches its hashed version.
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    Hashes a plain text password using bcrypt.
    """
    return pwd_context.hash(password)
