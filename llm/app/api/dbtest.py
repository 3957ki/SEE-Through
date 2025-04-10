from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.database import get_db

router = APIRouter()

@router.get("/ping-db")
def ping_db(db: Session = Depends(get_db)):
    """
    DB 연결 상태 확인용 엔드포인트
    """
    try:
        result = db.execute(text("SELECT version();"))
        db_version = result.fetchone()
        return {"message": "✅ DB 연결 성공", "db_version": db_version[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"❌ DB 연결 실패: {str(e)}")
