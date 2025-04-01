from pydantic import BaseModel
from typing import List


class DiseaseVectorItem(BaseModel):
    disease: str
    ingredient: str
    reason: str


class DiseaseVectorInsertRequest(BaseModel):
    items: List[DiseaseVectorItem]


class DiseaseVectorInsertResponse(BaseModel):
    success_count: int
    failed_items: List[DiseaseVectorItem]
