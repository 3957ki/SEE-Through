from app.schemas.ingredient import UpdateIngredientRequest, UpdateIngredientResponse
from app.schemas.common import Embedding
from app.core.embedding import get_embedding

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
