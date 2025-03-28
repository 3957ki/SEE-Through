from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.comment import CommentResponse
from app.services.comment_service import generate_food_comment

router = APIRouter()


@router.get("/food/comment", response_model=CommentResponse)
def get_food_comment(member_id: str, ingredient_id: str, db: Session = Depends(get_db)):
    """
    특정 사용자가 냉장고에서 음식을 꺼낼 때, LLM을 이용한 코멘트를 제공하는 API
    """
    comment = generate_food_comment(member_id, ingredient_id, db)

    if not comment:
        raise HTTPException(status_code=404, detail="음식 코멘트 생성 실패")

    return comment
