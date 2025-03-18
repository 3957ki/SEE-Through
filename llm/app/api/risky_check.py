from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.services.risky_check_service import get_risky_ingredients
from app.schemas.risky_check import RiskyCheckResponse

router = APIRouter()

@router.get("/risky-check/{member_id}", response_model=RiskyCheckResponse)
def risky_check(member_id: str, db: Session = Depends(get_db)):
    """
    특정 사용자의 냉장고에서 위험한 음식이 있는지 확인하는 API
    위험한 음식이 없을 경우, 404가 아니라 정상적인 응답을 반환함.
    """
    risky_ingredients = get_risky_ingredients(member_id, db)

    # 위험한 음식이 없을 경우, 200 응답을 반환
    if not risky_ingredients:
        return {
            "member_id": member_id,
            "risky_ingredients": [],
        }
    
    # 위험한 음식이 있을 경우, 정상적으로 리스트 반환
    return {
        "member_id": member_id,
        "risky_ingredients": risky_ingredients
    }
