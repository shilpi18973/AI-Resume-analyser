import re, io
from functools import lru_cache
import fitz, docx
from .roles import ROLES, SKILL_VOCAB, SOFT_SKILLS

# Scoring (documented): similarity >= MATCH -> matched (credit 1.0); >= PARTIAL -> partial (0.5); else missing (0).
# Career-fit = sum(weight * credit) / sum(weight) * 100. It is a heuristic, NOT a hiring probability.
MATCH, PARTIAL = 0.80, 0.55
HEADS = ["education","experience","projects","certification","skills","summary","achievements","internship","objective"]

_model = None
def model():
    global _model
    if _model is None:
        try:
            from sentence_transformers import SentenceTransformer
            _model = SentenceTransformer("all-MiniLM-L6-v2")
        except Exception:
            _model = False  # falls back to exact matching only
    return _model or None

@lru_cache(maxsize=2048)
def enc(text):
    return model().encode([text], normalize_embeddings=True)[0]

def read_text(name, data):
    if name.lower().endswith(".pdf"):
        with fitz.open(stream=data, filetype="pdf") as d:
            return "\n".join(p.get_text() for p in d)
    return "\n".join(p.text for p in docx.Document(io.BytesIO(data)).paragraphs)

def section(lines, key):
    out, on = [], False
    for l in lines:
        t = l.lower().strip(": ")
        is_head = len(t) < 30 and any(h in t for h in HEADS)
        if is_head and key in t: on = True; continue
        if on and is_head: break
        if on: out.append(l)
    return out[:15]

def extract(text):
    low = text.lower()
    has = lambda s: re.search(r"(?<![a-z0-9+#])" + re.escape(s) + r"(?![a-z0-9+#])", low) is not None
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    email = re.search(r"[\w.+-]+@[\w-]+\.[\w.]+", text)
    phone = re.search(r"\+?\d[\d\s().-]{8,}\d", text)
    edu = [l for l in lines if re.search(r"b\.?tech|m\.?tech|bachelor|master|b\.?sc|m\.?sc|mba|diploma|university|college|institute", l, re.I)][:5]
    return {
        "name": lines[0] if lines and len(lines[0]) < 50 else None,
        "email": email.group() if email else None,
        "phone": phone.group().strip() if phone else None,
        "skills": [s for s in SKILL_VOCAB if has(s)],
        "soft_skills": [s for s in SOFT_SKILLS if has(s)],
        "education": edu,
        "experience": section(lines, "experience") or section(lines, "internship"),
        "projects": section(lines, "projects"),
        "certifications": section(lines, "certification"),
        "summary": " ".join(section(lines, "summary") or section(lines, "objective"))[:500] or None,
    }

def match_role(skills, req):
    items, num, den = [], 0.0, 0.0
    m = model()
    for skill, w in req.items():
        sim, best = 0.0, None
        if skill in skills: sim, best = 1.0, skill
        elif m and skills:
            sims = [(float(enc(skill) @ enc(s)), s) for s in skills]
            sim, best = max(sims)
        status = "matched" if sim >= MATCH else "partial" if sim >= PARTIAL else "missing"
        num += w * {"matched": 1, "partial": .5, "missing": 0}[status]; den += w
        items.append({"skill": skill, "weight": w, "status": status, "similarity": round(sim, 2), "matched_with": best if status != "missing" else None})
    counts = {k: sum(i["status"] == k for i in items) for k in ("matched", "partial", "missing")}
    return {"score": round(num / den * 100, 1), "items": items, "counts": counts}

def match_all(skills):
    return {role: match_role(skills, req) for role, req in ROLES.items()}
