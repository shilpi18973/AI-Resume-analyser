from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, DateTime, JSON, Float, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker

engine = create_engine("sqlite:///careerai.db", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Analysis(Base):
    __tablename__ = "analyses"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    filename = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    extracted = Column(JSON)   # name, email, skills, soft skills, education, ...
    matches = Column(JSON)     # role -> {score, items[], counts}
    best_role = Column(String)
    best_score = Column(Float)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
