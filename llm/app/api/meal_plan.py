from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.services.meal_plan_service import create_meal_plan_service
from app.schemas.meal_plan import MealPlanRequest, MealPlanResponse

router = APIRouter()

@router.post("/meal-plan", response_model=MealPlanResponse)
def create_meal_plan(request: MealPlanRequest, db: Session = Depends(get_db)):
    """
    참여자(member_id) 정보를 조회하고, 냉장고의 재료를 활용하여 최적의 식단을 생성하는 API
    """
    try:
        return create_meal_plan_service(request, db)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
