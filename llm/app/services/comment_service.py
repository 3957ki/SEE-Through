from sqlalchemy.orm import Session
from app.services.ingredient_service import get_ingredient_by_id
from app.utils.similarity import find_most_similar_log, check_recently_eaten
from app.core.langchain_coment import generate_food_comment_from_llm

def generate_food_comment(member_id: str, ingredient_id: str, db: Session):
    """
    LLM을 활용하여 사용자가 꺼낸 음식에 대한 코멘트 제공
    """
    ingredient = get_ingredient_by_id(ingredient_id, db)
    if not ingredient:
        return None

    # 가장 연관성 높은 냉장고 로그 찾기
    log_entry = find_most_similar_log(member_id, ingredient.embedding_vector, db)

    related_food = log_entry.ingredient_name if log_entry else "최근 섭취한 음식 없음"
    recently_eaten = check_recently_eaten(member_id, ingredient.name, db)

    # LLM을 활용한 코멘트 생성
    comment = generate_food_comment_from_llm(ingredient.name, related_food, recently_eaten)

    return {
        "ingredient_id": ingredient.ingredient_id,
        "name": ingredient.name,
        "comment": comment
    }
