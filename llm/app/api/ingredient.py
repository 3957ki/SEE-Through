from fastapi import APIRouter, HTTPException
from app.schemas.ingredient import UpdateIngredientRequest, UpdateIngredientResponse
from app.services.ingredient_service import process_update_ingredients

router = APIRouter()

@router.post("/embedding/ingredient", response_model=UpdateIngredientResponse)
def update_ingredient(update_request: UpdateIngredientRequest):
    """
    냉장고 재료 업데이트 API (냉장고 입고 시)
    """
    try:
        response = process_update_ingredients(update_request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
