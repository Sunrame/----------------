"""Авторизация админа (подписанная cookie) и утилиты: IP, хэши."""
import hashlib
import hmac
import os

from fastapi import HTTPException, Request
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer

SECRET = os.environ.get("SECRET_KEY", "dev-secret-change-me")
COOKIE = "vh_admin"
MAX_AGE = 60 * 60 * 24 * 7  # неделя

_signer = URLSafeTimedSerializer(SECRET, salt="vpnhub-admin")


def make_token() -> str:
    return _signer.dumps({"role": "admin"})


def token_ok(token: str) -> bool:
    try:
        _signer.loads(token, max_age=MAX_AGE)
        return True
    except (BadSignature, SignatureExpired):
        return False
    except Exception:
        return False


def require_admin(request: Request) -> None:
    """FastAPI-зависимость: пускает только с валидной админ-cookie."""
    token = request.cookies.get(COOKIE)
    if not token or not token_ok(token):
        raise HTTPException(status_code=401, detail="Требуется вход")


def creds_ok(user: str, password: str) -> bool:
    env_user = os.environ.get("ADMIN_USER", "admin")
    env_pass = os.environ.get("ADMIN_PASSWORD", "")
    if not env_pass:  # пароль не настроен — вход закрыт
        return False
    return hmac.compare_digest(user, env_user) and hmac.compare_digest(password, env_pass)


def client_ip(request: Request) -> str:
    """Реальный IP за прокси Railway (X-Forwarded-For)."""
    xff = request.headers.get("x-forwarded-for")
    if xff:
        return xff.split(",")[0].strip()
    return request.client.host if request.client else "0.0.0.0"


def ip_hash(request: Request) -> str:
    """Солёный хэш IP — для антинакрутки, сам IP не храним."""
    return hashlib.sha256((SECRET + client_ip(request)).encode()).hexdigest()[:32]
