from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.models.models import Usuario
from pydantic import BaseModel
import jwt

SECRET = "secret123"

router = APIRouter(prefix="/auth", tags=["Auth"])


class LoginRequest(BaseModel):
    email: str
    password: str


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(Usuario).filter(Usuario.email == data.email).first()

    if not user or user.password_hash != data.password:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

    token = jwt.encode({"user_id": str(user.id)}, SECRET, algorithm="HS256")

    return {"access_token": token}