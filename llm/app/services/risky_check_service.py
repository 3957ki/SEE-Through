from sqlalchemy.orm import Session
from app.core.langchain_risky_check import analyze_risky_foods_with_comments
from app.db.models import Ingredient, Member

def get_risky_ingredients(member_id: str, db: Session):
    """
    특정 사용자의 냉장고에서 위험한 음식이 있는지 LLM을 통해 판별 후 경고 메시지 반환
    """
    ingredients = db.query(Ingredient).all()
    
    if not ingredients:
        return []
    
    user = db.query(Member).filter(Member.member_id == member_id).first()
    if not user:
        return []

    user_allergies = user.allergies or []
    user_diseases = user.diseases or []

    # 모든 재료를 한 번에 LLM으로 전달하여 위험 여부 + 경고 메시지 분석
    food_names = [ingredient.name for ingredient in ingredients]
    print("DEBUG: food_names ->", food_names)
    
    risky_foods = analyze_risky_foods_with_comments(
        food_names=food_names,
        allergies=user_allergies,
        diseases=user_diseases  
    )

    # 위험한 음식(코멘트가 있는 음식)만 필터링하여 응답 반환
    risky_ingredients = []
    for ingredient in ingredients:
        for food in risky_foods:
            if ingredient.name == food.food_name and food.comment.strip():  # 코멘트가 있는 경우만 포함
                risky_ingredients.append({
                    "ingredient_id": ingredient.ingredient_id,
                    "name": ingredient.name,
                    "comment": food.comment  # LLM이 생성한 경고 메시지
                })

    return risky_ingredients
