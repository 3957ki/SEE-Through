from sqlalchemy.orm import Session
from app.services.ingredient_service import get_ingredient_by_id
from app.utils.similarity import find_most_similar_log, check_recently_eaten
from app.core.langchain_coment import generate_food_comment_from_llm
from app.db.models import Member

def generate_food_comment(member_id: str, ingredient_id: str, db: Session):
    """
    LLM을 활용하여 사용자가 꺼낸 음식에 대한 코멘트 제공
    """
    ingredient = get_ingredient_by_id(ingredient_id, db)
    if not ingredient:
        return None
    
     # 사용자 정보 조회
    user = db.query(Member).filter(Member.member_id == member_id).first()
    if not user:
        return None

    preferred_foods = user.preferred_foods or []
    disliked_foods = user.disliked_foods or []

    # 가장 연관성 높은 냉장고 로그 찾기
    log_entry = find_most_similar_log(member_id, ingredient.embedding_vector, db)

    related_food = log_entry.ingredient_name if log_entry else "최근 섭취한 음식 없음"
    recently_eaten = check_recently_eaten(member_id, ingredient.name, db)

    # LLM을 활용한 코멘트 생성
    comment_data = generate_food_comment_from_llm(
        ingredient.name,
        preferred_foods,
        disliked_foods,
        related_food,
        recently_eaten
    )

    return {
        "ingredient_id": ingredient.ingredient_id,
        "name": ingredient.name,
        "category": comment_data["category"],  
        "category_name": comment_data["category_name"],  
        "comment": comment_data["comment"]
    }
