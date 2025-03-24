from pydantic import BaseModel
from typing import List

class SimpleMealScheduleRequest(BaseModel):
    meal_id: str
    serving_date: str
    serving_time: str 
    
class SimpleMealScheduleResponse(BaseModel):
    meal_id: str
    menu: List[str]
    reason: str

class SimpleMealPlanRequest(BaseModel):
    member_id: str
    schedules: List[SimpleMealScheduleRequest]

class SimpleMealPlanResponse(BaseModel):
    member_id: str
    schedules: List[SimpleMealScheduleResponse]
    required_ingredients: List[str]