from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.services.risky_check_service import get_risky_ingredients
from app.schemas.risky_check import RiskyCheckResponse

router = APIRouter()

@router.get("/risky-check", response_model=RiskyCheckResponse)
def risky_check(member_id: str = Query(..., description="사용자 ID"), db: Session = Depends(get_db)):
    """
    특정 사용자의 냉장고에서 위험한 음식이 있는지 확인하는 API
    """
    risky_ingredients = get_risky_ingredients(member_id, db)

    # 위험한 음식이 없을 경우, 200 응답을 반환
    return {
        "member_id": member_id,
        "risky_ingredients": risky_ingredients if risky_ingredients else [],
    }
