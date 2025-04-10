from pydantic import BaseModel
from typing import List
from datetime import datetime
from app.schemas.common import EmbeddingLog

class FoodLog(BaseModel):
    ingredient_log_id: str
    member_id: str
    food: str
    date: datetime

class FoodLogRequest(BaseModel):
    logs: List[FoodLog]

class FoodLogResponse(BaseModel):
    embeddings: List[EmbeddingLog]
