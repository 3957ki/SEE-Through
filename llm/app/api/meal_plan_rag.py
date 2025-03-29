from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.services.meal_plan_rag_service import create_rag_meal_plan_service
from app.schemas.meal_plan import SimpleMealPlanRequest, SimpleMealPlanResponse

router = APIRouter()


@router.post("/rag-meal-plan", response_model=SimpleMealPlanResponse)
async def create_rag_meal_plan(
    request: SimpleMealPlanRequest, db: Session = Depends(get_db)
):
    try:
        return await create_rag_meal_plan_service(request, db)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
