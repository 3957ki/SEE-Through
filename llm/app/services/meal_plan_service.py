from sqlalchemy.orm import Session
from app.db.models import Member, Ingredient
from app.core.langchain_meal import generate_meal_plan_from_llm
from app.schemas.meal_plan import MealPlanRequest, MealPlanResponse, MealScheduleResponse

def create_meal_plan_service(request: MealPlanRequest, db: Session) -> MealPlanResponse:
    """
    참여자 정보를 조회하고, 냉장고 재료를 최대한 활용하여 LLM 기반 식단을 생성하는 서비스
    """

    members = db.query(Member).filter(Member.member_id.in_(request.participations)).all()
    if not members:
        raise ValueError("참여자 정보를 찾을 수 없음")

    preferred_foods = set()
    disliked_foods = set()
    allergies = set()
    
    for member in members:
        preferred_foods.update(member.preferred_foods or [])
        disliked_foods.update(member.disliked_foods or [])
        allergies.update(member.allergies or [])

    available_ingredients = db.query(Ingredient.name).distinct().all()
    available_ingredients = {ing.name for ing in available_ingredients}

    llm_result = generate_meal_plan_from_llm(
        description=request.description,
        schedules=request.schedules,
        preferred_foods=list(preferred_foods),
        disliked_foods=list(disliked_foods),
        allergies=list(allergies),
        available_ingredients=available_ingredients
    )

    response_schedules = [
        MealScheduleResponse(
            meal_id=request.schedules[i].meal_id,
            menu=llm_result.schedules[i].menu
        )
        for i in range(len(request.schedules))
    ]

    return MealPlanResponse(
        meal_plan_id=request.meal_plan_id,
        participations=request.participations,
        description=request.description,
        schedules=response_schedules,
        required_ingredients=llm_result.required_ingredients
    )
