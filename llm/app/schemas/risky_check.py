from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class IngredientSchema(BaseModel):
    ingredient_id: str
    name: str
    image_path: str
    inbound_at: datetime
    expiration_at: Optional[datetime]

class RiskyCheckResponse(BaseModel):
    member_id: str
    risky_ingredients: List[dict]  # 위험 재료 정보와 맞춤 코멘트 포함
