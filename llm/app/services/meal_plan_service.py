from sqlalchemy.orm import Session
from app.db.models import Member, Ingredient
from app.core.langchain_meal import generate_single_meal
import asyncio
from app.schemas.meal_plan import (
    SimpleMealPlanRequest,
    SimpleMealPlanResponse,
    SimpleMealScheduleResponse,
)


async def create_meal_plan_service(
    request: SimpleMealPlanRequest, db: Session
) -> SimpleMealPlanResponse:
    member = db.query(Member).filter(Member.member_id == request.member_id).first()
    if not member:
        raise ValueError("해당 member_id를 가진 사용자를 찾을 수 없습니다.")

    preferred_foods = member.preferred_foods or []
    disliked_foods = member.disliked_foods or []
    allergies = member.allergies or []
    diseases = member.diseases or []
    birthday = member.birth
    available_ingredients = db.query(Ingredient.name).distinct().all()
    available_ingredients = {ing.name for ing in available_ingredients}

    # 비동기 요청 리스트
    tasks = [
        generate_single_meal(
            description="사용자의 일정에 맞는 식단 구성",
            schedule=schedule,
            preferred_foods=preferred_foods,
            disliked_foods=disliked_foods,
            allergies=allergies,
            diseases=diseases,
            birthday=birthday,
            available_ingredients=available_ingredients,
        )
        for schedule in request.schedules
    ]

    meal_results = await asyncio.gather(*tasks)

    response_schedules = []
    all_required_ingredients = set()

    for i, (meal, required_ings) in enumerate(meal_results):
        response_schedules.append(
            SimpleMealScheduleResponse(
                meal_id=request.schedules[i].meal_id, menu=meal.menu, reason=meal.reason
            )
        )
        all_required_ingredients.update(required_ings)

    return SimpleMealPlanResponse(
        member_id=request.member_id,
        schedules=response_schedules,
        required_ingredients=list(all_required_ingredients),
    )
