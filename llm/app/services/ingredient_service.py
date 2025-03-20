from app.schemas.ingredient import UpdateIngredientRequest, UpdateIngredientResponse
from app.schemas.common import Embedding
from app.core.embedding import get_embedding
from sqlalchemy.orm import Session
from app.db.models import Ingredient

def process_update_ingredients(request: UpdateIngredientRequest) -> UpdateIngredientResponse:
    """
    재료 업데이트 요청 처리
    각 재료 이름을 기반으로 OpenAI 임베딩을 호출하여 벡터를 생성합니다.
    """
    embeddings = []
    for ing in request.ingredients:
        emb = get_embedding(ing.name)
        embeddings.append(Embedding(ingredient_id=ing.ingredient_id, embedding=emb))
    return UpdateIngredientResponse(embeddings=embeddings)

def get_ingredient_by_id(ingredient_id: str, db: Session):
    """
    특정 ingredient_id에 해당하는 식재료 정보를 조회
    """
    return db.query(Ingredient).filter(Ingredient.ingredient_id == ingredient_id).first()