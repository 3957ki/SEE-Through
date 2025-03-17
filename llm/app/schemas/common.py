from pydantic import BaseModel
from typing import List

class Embedding(BaseModel):
    ingredient_id: str
    embedding: List[float]
