from pydantic import BaseModel
from typing import List

class MealScheduleRequest(BaseModel):
    meal_id: str
    serving_date: str
    serving_day: str
    serving_time: int

class MealScheduleResponse(BaseModel):
    meal_id: str
    menu: List[str]

class MealPlanRequest(BaseModel):
    meal_plan_id: str
    participations: List[str]
    description: str
    schedules: List[MealScheduleRequest]

class MealPlanResponse(BaseModel):
    meal_plan_id: str
    participations: List[str]
    description: str
    schedules: List[MealScheduleResponse]
    required_ingredients: List[str]
