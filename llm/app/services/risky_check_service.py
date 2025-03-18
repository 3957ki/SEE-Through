from sqlalchemy.orm import Session
from app.core.langchain_client import analyze_risky_foods_with_comments
from app.db.models import Ingredient

def get_risky_ingredients(member_id: str, db: Session):
    """
    특정 사용자의 냉장고에서 위험한 음식이 있는지 LLM을 통해 판별 후 경고 메시지 반환
    """
    ingredients = db.query(Ingredient).filter(Ingredient.member_id == member_id).all()
    
    if not ingredients:
        return []

    # 모든 재료를 한 번에 LLM으로 전달하여 위험 여부 + 경고 메시지 분석
    food_names = [ingredient.name for ingredient in ingredients]
    risky_foods = analyze_risky_foods_with_comments(food_names)

    # 위험한 음식만 필터링하여 응답 반환
    risky_ingredients = []
    for ingredient in ingredients:
        for food in risky_foods:
            if ingredient.name == food.food_name and food.is_risky:
                risky_ingredients.append({
                    "ingredient_id": ingredient.ingredient_id,
                    "name": ingredient.name,
                    "image_path": ingredient.image_path,
                    "risk_reason": food.risk_reason,  # LLM이 제공한 위험 사유
                    "comment": food.comment  # LLM이 생성한 경고 메시지
                })

    return risky_ingredients
