from pydantic import BaseModel
from typing import List
from datetime import datetime
from app.schemas.common import Embedding

class FoodLog(BaseModel):
    member_id: str
    ingredient_id: str
    food: str
    date: datetime

class FoodLogRequest(BaseModel):
    logs: List[FoodLog]

class FoodLogResponse(BaseModel):
    embeddings: List[Embedding]
