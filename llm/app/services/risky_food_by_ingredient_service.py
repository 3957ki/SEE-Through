from sqlalchemy.orm import Session
from app.core.langchain_risky_check_by_ingredient import analyze_risky_food_for_members
from app.db.models import Member
import json

def check_risky_food_by_ingredient(ingredient: str, db: Session):
    """
    특정 음식(ingredient)이 모든 사용자(member_id)의 알러지 정보를 고려했을 때 위험할 가능성이 있는지 확인하는 함수
    """
    members = db.query(Member).all()
    
    if not members:
        return None

    # 사용자별 알레르기 정보를 JSON 문자열로 변환
    allergy_data = json.dumps({member.member_id: member.allergies for member in members if member.allergies})

    # LLM을 활용하여 위험 가능성이 있는 사용자 분석
    risky_members = analyze_risky_food_for_members(ingredient, allergy_data)

    return {
        "ingredient": ingredient,
        "risky_members": risky_members if risky_members else [],
    }
