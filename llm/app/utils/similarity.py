from sqlalchemy.orm import Session
from app.db.models import IngredientLog
import numpy as np
from datetime import datetime, timedelta


def find_most_similar_log(member_id: str, ingredient_vector, db: Session):
    """
    사용자의 냉장고 로그에서 현재 식재료와 가장 유사한 로그를 찾음
    """
    logs = db.query(IngredientLog).filter(IngredientLog.member_id == member_id).all()

    if not logs:
        return None

    best_match = None
    highest_similarity = -1

    for log in logs:
        similarity = np.dot(ingredient_vector, log.embedding_vector) / (
            np.linalg.norm(ingredient_vector) * np.linalg.norm(log.embedding_vector)
        )

        if similarity > highest_similarity:
            highest_similarity = similarity
            best_match = log

    return best_match


def check_recently_eaten(member_id: str, food_name: str, db: Session) -> str:
    """
    최근 특정 음식을 자주 섭취했는지 확인
    """
    recent_logs = (
        db.query(IngredientLog)
        .filter(
            IngredientLog.member_id == member_id,
            IngredientLog.ingredient_name == food_name,
            IngredientLog.movement_type == "OUTBOUND",
            IngredientLog.created_at >= datetime.utcnow() - timedelta(days=7),
        )
        .count()
    )

    if recent_logs >= 3:
        return "이 음식을 최근 많이 섭취하셨네요!"
    elif recent_logs >= 1:
        return "최근에도 드셨던 음식이에요!"
    else:
        return "최근에 드신 기록이 없어요."
