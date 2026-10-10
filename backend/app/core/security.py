import os
import sys
import hashlib
import hmac
from datetime import datetime, timedelta, timezone
from typing import Any, Union, Optional, Tuple

_backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

try:
    import jwt  # type: ignore
except Exception:  # pragma: no cover
    class _MockJWT:  # type: ignore
        class PyJWTError(Exception):
            pass
        @staticmethod
        def encode(payload: Any, key: Any, algorithm: str = "HS256") -> str:
            import json, base64
            header = base64.urlsafe_b64encode(json.dumps({"alg": algorithm, "typ": "JWT"}).encode()).decode().rstrip("=")
            body = base64.urlsafe_b64encode(json.dumps(payload, default=str).encode()).decode().rstrip("=")
            return f"{header}.{body}.mock_sig"
        @staticmethod
        def decode(token: str, key: Any, algorithms: Any = None) -> Optional[dict]:
            import json, base64
            try:
                parts = token.split(".")
                if len(parts) >= 2:
                    padded = parts[1] + "=" * ((4 - len(parts[1]) % 4) % 4)
                    return json.loads(base64.urlsafe_b64decode(padded).decode())
            except Exception:
                pass
            return None
    jwt: Any = _MockJWT()

try:
    from app.core.config import settings  # type: ignore
except Exception:  # pragma: no cover
    from backend.app.core.config import settings  # type: ignore

def hash_password(password: str, salt: Optional[str] = None) -> Tuple[str, str]:
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
    to_encode: dict[str, Any] = {}
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
