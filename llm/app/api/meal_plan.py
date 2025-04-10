from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.services.meal_plan_service import create_meal_plan_service
from app.schemas.meal_plan import SimpleMealPlanRequest, SimpleMealPlanResponse

router = APIRouter()


@router.post("/meal-plan", response_model=SimpleMealPlanResponse)
async def create_meal_plan(request: SimpleMealPlanRequest, db: Session = Depends(get_db)):
    """
    참여자(member_id)의 냉장고 재료와 선호도를 반영해 식단을 생성하는 API
    """
    try:
        return await create_meal_plan_service(request, db)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
