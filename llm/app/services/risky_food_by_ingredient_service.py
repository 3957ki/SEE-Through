from sqlalchemy.orm import Session
from app.core.langchain_risky_check_by_ingredient import analyze_risky_food_for_members
from app.db.models import Member
import json


def check_risky_food_by_ingredient(ingredient: str, db: Session):
    members = db.query(Member).all()

    if not members:
        return None

    # 사용자별 알레르기 + 질병 정보 함께 JSON으로 구성
    health_data = {
        member.member_id: {
            "allergies": member.allergies or [],
            "diseases": member.diseases or [],
        }
        for member in members
        if member.allergies or member.diseases
    }

    health_data_json = json.dumps(health_data, ensure_ascii=False)

    risky_members = analyze_risky_food_for_members(ingredient, health_data_json, db)

    return {
        "ingredient": ingredient,
        "risky_members": risky_members if risky_members else [],
    }
