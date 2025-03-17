from pydantic import BaseModel
from typing import List
from app.schemas.common import Embedding

class Ingredient(BaseModel):
    ingredient_id: str
    name: str

class UpdateIngredientRequest(BaseModel):
    ingredients: List[Ingredient]

class UpdateIngredientResponse(BaseModel):
    embeddings: List[Embedding]
