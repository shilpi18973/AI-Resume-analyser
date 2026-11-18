from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Response
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session
from .db import get_db, User, Analysis
from .security import hash_pw, verify_pw, make_token, current_user
from .roles import ROLES
from . import nlp

router = APIRouter()

class SignupIn(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
class LoginIn(BaseModel):
    email: EmailStr
    password: str

def user_out(u): return {"id": u.id, "name": u.name, "email": u.email}
def set_cookie(r, u): r.set_cookie("access_token", make_token(u.id), httponly=True, samesite="lax", max_age=604800)

@router.post("/auth/signup", status_code=201)
def signup(b: SignupIn, r: Response, db: Session = Depends(get_db)):
    if db.query(User).filter_by(email=b.email.lower()).first(): raise HTTPException(409, "Email already registered")
    u = User(name=b.name, email=b.email.lower(), password_hash=hash_pw(b.password)); db.add(u); db.commit()
    set_cookie(r, u); return user_out(u)

@router.post("/auth/login")
def login(b: LoginIn, r: Response, db: Session = Depends(get_db)):
    u = db.query(User).filter_by(email=b.email.lower()).first()
    if not u or not verify_pw(u.password_hash, b.password): raise HTTPException(401, "Invalid email or password")
    set_cookie(r, u); return user_out(u)

@router.post("/auth/logout")
def logout(r: Response): r.delete_cookie("access_token"); return {"ok": True}

@router.get("/auth/me")
def me(u: User = Depends(current_user)): return user_out(u)

def get_a(db, u, id):
    q = db.query(Analysis).filter_by(user_id=u.id)  # always scoped to the owner
    a = q.order_by(Analysis.id.desc()).first() if id == "latest" else (q.filter_by(id=int(id)).first() if id.isdigit() else None)
    if not a: raise HTTPException(404, "Analysis not found")
    return a

def a_out(a):
    return {"id": a.id, "filename": a.filename, "created_at": a.created_at.isoformat(), "best_role": a.best_role,
            "best_score": a.best_score, "extracted": a.extracted, "matches": a.matches}

@router.post("/resumes/upload", status_code=201)
async def upload(file: UploadFile = File(...), u: User = Depends(current_user), db: Session = Depends(get_db)):
    if not (file.filename or "").lower().endswith((".pdf", ".docx")): raise HTTPException(400, "Only PDF or DOCX files are allowed")
    data = await file.read()
    if len(data) > 5 * 1024 * 1024: raise HTTPException(413, "File exceeds 5 MB")
    try: text = nlp.read_text(file.filename, data)
    except Exception: raise HTTPException(422, "Could not read this file")
    if len(text.strip()) < 50: raise HTTPException(422, "No readable text found (scanned PDF?)")
    ext = nlp.extract(text); matches = nlp.match_all(ext["skills"])
    best = max(matches, key=lambda k: matches[k]["score"])
    a = Analysis(user_id=u.id, filename=file.filename, extracted=ext, matches=matches, best_role=best, best_score=matches[best]["score"])
    db.add(a); db.commit(); db.refresh(a); return a_out(a)

@router.get("/resumes/history")
def history(u: User = Depends(current_user), db: Session = Depends(get_db)):
    rows = db.query(Analysis).filter_by(user_id=u.id).order_by(Analysis.id.desc()).all()
    return [{"id": a.id, "filename": a.filename, "created_at": a.created_at.isoformat(), "best_role": a.best_role, "best_score": a.best_score} for a in rows]

@router.get("/resumes/{id}")
def get_resume(id: str, u: User = Depends(current_user), db: Session = Depends(get_db)): return a_out(get_a(db, u, id))

@router.delete("/resumes/{id}", status_code=204)
def delete_resume(id: str, u: User = Depends(current_user), db: Session = Depends(get_db)):
    db.delete(get_a(db, u, id)); db.commit()

@router.get("/analysis/{id}/career-matches")
def career_matches(id: str, u: User = Depends(current_user), db: Session = Depends(get_db)):
    m = get_a(db, u, id).matches
    return sorted(({"role": k, **v} for k, v in m.items()), key=lambda x: -x["score"])

@router.get("/analysis/{id}/skill-gaps")
def skill_gaps(id: str, role: str, u: User = Depends(current_user), db: Session = Depends(get_db)):
    m = get_a(db, u, id).matches
    if role not in m: raise HTTPException(404, "Unknown role")
    return {"role": role, **m[role]}

@router.get("/careers")
def careers(u: User = Depends(current_user)): return [{"role": k, "skills": v} for k, v in ROLES.items()]

@router.get("/dashboard/stats")
def dashboard(u: User = Depends(current_user), db: Session = Depends(get_db)):
    rows = db.query(Analysis).filter_by(user_id=u.id).order_by(Analysis.id).all()
    if not rows: return {"empty": True, "total": 0}
    last = rows[-1]; best = last.matches[last.best_role]
    return {"empty": False, "total": len(rows), "latest_id": last.id, "skills_detected": len(last.extracted["skills"]),
            "best_role": last.best_role, "best_score": last.best_score, "counts": best["counts"],
            "role_scores": sorted(({"role": k, "score": v["score"]} for k, v in last.matches.items()), key=lambda x: -x["score"]),
            "trend": [{"date": a.created_at.strftime("%d %b"), "score": a.best_score} for a in rows],
            "recent": [{"id": a.id, "filename": a.filename, "best_role": a.best_role, "best_score": a.best_score} for a in rows[-5:][::-1]]}
