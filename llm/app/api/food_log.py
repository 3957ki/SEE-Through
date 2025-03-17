from fastapi import APIRouter, HTTPException
from app.schemas.food import FoodLogRequest, FoodLogResponse
from app.services.food_service import process_food_logs

router = APIRouter()

@router.post("/log-food", response_model=FoodLogResponse)
def log_food(food_log_request: FoodLogRequest):
    """
    음식 섭취 기록 저장 API
    """
    try:
        response = process_food_logs(food_log_request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
