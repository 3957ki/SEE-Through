from sqlalchemy.orm import Session
from app.db.models import Member, Ingredient
from app.core.langchain_meal import generate_meal_plan_from_llm
from app.schemas.meal_plan import (
    SimpleMealPlanRequest,
    SimpleMealPlanResponse,
    SimpleMealScheduleResponse
)

def create_meal_plan_service(request: SimpleMealPlanRequest, db: Session) -> SimpleMealPlanResponse:
    member = db.query(Member).filter(Member.member_id == request.member_id).first()
    if not member:
        raise ValueError("해당 member_id를 가진 사용자를 찾을 수 없습니다.")

    preferred_foods = member.preferred_foods or []
    disliked_foods = member.disliked_foods or []
    allergies = member.allergies or []

    available_ingredients = db.query(Ingredient.name).distinct().all()
    available_ingredients = {ing.name for ing in available_ingredients}

    birthday = member.birth
    diseases = member.diseases or []

    llm_result = generate_meal_plan_from_llm(
    description="사용자의 일정에 맞는 식단 구성",
    schedules=request.schedules,
    preferred_foods=preferred_foods,
    disliked_foods=disliked_foods,
    allergies=allergies,
    diseases=diseases,
    birthday=birthday,
    available_ingredients=available_ingredients
)

    response_schedules = [
        SimpleMealScheduleResponse(
            meal_id=request.schedules[i].meal_id,
            menu=llm_result.schedules[i].menu,
            reason=llm_result.schedules[i].reason
        )
        for i in range(len(request.schedules))
    ]

    return SimpleMealPlanResponse(
        member_id=request.member_id,
        schedules=response_schedules,
        required_ingredients=llm_result.required_ingredients
    )
