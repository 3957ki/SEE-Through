from sqlalchemy.orm import Session
from app.core.langchain_risky_check import analyze_risky_foods_with_comments
from app.db.models import Ingredient, Member


def get_risky_ingredients(member_id: str, db: Session):
    ingredients = db.query(Ingredient).all()
    if not ingredients:
        return []

    user = db.query(Member).filter(Member.member_id == member_id).first()
    if not user:
        return []

    user_allergies = user.allergies or []
    user_diseases = user.diseases or []
    user_age = user.age

    food_names = [ingredient.name for ingredient in ingredients]

    risky_foods = analyze_risky_foods_with_comments(
        food_names=food_names,
        allergies=user_allergies,
        diseases=user_diseases,
        age=user_age,
        db=db,
    )

    risky_ingredients = []
    for ingredient in ingredients:
        for food in risky_foods:
            if ingredient.name == food.food_name and food.comment.strip():
                risky_ingredients.append(
                    {
                        "ingredient_id": ingredient.ingredient_id,
                        "name": ingredient.name,
                        "comment": food.comment,
                    }
                )

    return risky_ingredients
