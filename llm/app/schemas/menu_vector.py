from pydantic import BaseModel
from typing import List


class MenuVectorInsertRequest(BaseModel):
    names: List[str]


class MenuVectorInsertResponse(BaseModel):
    success_count: int
    failed_names: List[str]
