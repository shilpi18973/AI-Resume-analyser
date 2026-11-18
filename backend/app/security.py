import os, jwt
from datetime import datetime, timedelta, timezone
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from fastapi import Cookie, Depends, HTTPException
from .db import get_db, User

SECRET = os.getenv("JWT_SECRET", "dev-only-change-me")  # set JWT_SECRET in production
ph = PasswordHasher()

def hash_pw(p): return ph.hash(p)
def verify_pw(h, p):
    try: return ph.verify(h, p)
    except VerifyMismatchError: return False

def make_token(uid):
    return jwt.encode({"sub": str(uid), "exp": datetime.now(timezone.utc) + timedelta(days=7)}, SECRET, "HS256")

def current_user(access_token: str | None = Cookie(default=None), db=Depends(get_db)):
    if not access_token: raise HTTPException(401, "Not authenticated")
    try: uid = int(jwt.decode(access_token, SECRET, ["HS256"])["sub"])
    except Exception: raise HTTPException(401, "Invalid or expired session")
    u = db.get(User, uid)
    if not u: raise HTTPException(401, "User not found")
    return u
