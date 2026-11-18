from fastapi import FastAPI
from .db import Base, engine
from .routes import router

Base.metadata.create_all(engine)
app = FastAPI(title="CareerAI")
app.include_router(router, prefix="/api")

@app.get("/")
def root():
    return {"message": "CareerAI API is running", "docs": "/docs"}
