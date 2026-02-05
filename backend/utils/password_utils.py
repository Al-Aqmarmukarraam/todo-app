from passlib.context import CryptContext
from passlib.hash import pbkdf2_sha256
from datetime import timezone

def hash_password(password: str) -> str:
    """Hash a password with pbkdf2"""
    return pbkdf2_sha256.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against its hash"""
    return pbkdf2_sha256.verify(plain_password, hashed_password)