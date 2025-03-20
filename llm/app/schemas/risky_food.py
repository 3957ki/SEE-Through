from pydantic import BaseModel
from typing import List

class RiskyMemberResponse(BaseModel):
    member_id: str
    comment: str

class RiskyFoodResponse(BaseModel):
    ingredient: str
    risky_members: List[RiskyMemberResponse]
