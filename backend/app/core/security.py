import os
import hashlib
import hmac
from datetime import datetime, timedelta, timezone
from typing import Any, Union, Optional
import jwt
from app.core.config import settings

def hash_password(password: str, salt: Optional[str] = None) -> tuple[str, str]:
    if not salt:
        salt = os.urandom(16).hex()
    pwd_hash = hashlib.pbkdf2_hmac(
        'sha512',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    ).hex()
    return pwd_hash, salt

def get_password_hash(password: str) -> str:
    salt = os.urandom(16).hex()
    pwd_hash, _ = hash_password(password, salt)
    return f"{salt}${pwd_hash}"

def verify_password(plain_password: str, password_hash: str, salt: Optional[str] = None) -> bool:
    if not password_hash:
        return False
    if "$" in password_hash and not salt:
        extracted_salt, expected_hash = password_hash.split("$", 1)
        attempt_hash, _ = hash_password(plain_password, extracted_salt)
        return hmac.compare_digest(attempt_hash, expected_hash)
    if salt:
        attempt_hash, _ = hash_password(plain_password, salt)
        return hmac.compare_digest(attempt_hash, password_hash)
    return False

def create_access_token(data: Union[dict, str, Any], expires_delta: Optional[timedelta] = None) -> str:
    if isinstance(data, dict):
        to_encode = data.copy()
    else:
        to_encode = {"sub": str(data)}

    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode["exp"] = expire
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except (jwt.PyJWTError, Exception):
        return None
