from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.risky_food import RiskyFoodResponse
from app.services.risky_food_by_ingredient_service import check_risky_food_by_ingredient

router = APIRouter()

@router.get("/food/risky-check", response_model=RiskyFoodResponse)
def get_risky_food_by_ingredient(ingredient: str = Query(..., description="확인할 음식 재료"), db: Session = Depends(get_db)):
    """
    특정 음식(ingredient)이 모든 사용자(member_id)의 알러지 정보를 고려했을 때 위험할 가능성이 있는지 확인하는 API
    """
    result = check_risky_food_by_ingredient(ingredient, db)
    
    if not result:
        return {
            "ingredient": ingredient,
            "risky_members": [],
        }
    
    return result
