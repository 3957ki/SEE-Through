from app.schemas.food import FoodLogRequest, FoodLogResponse
from app.schemas.common import Embedding
from app.core.embedding import get_embedding

def process_food_logs(request: FoodLogRequest) -> FoodLogResponse:
    """
    음식 기록 요청 처리
    """
    embeddings = []
    for log in request.logs:
        # 텍스트 구성
        text = f"{log.member_id}가 {log.date}에 {log.food}를 섭취"
        # 임베딩 생성
        emb = get_embedding(text)
        embeddings.append(Embedding(ingredient_id=log.ingredient_id, embedding=emb))
    return FoodLogResponse(embeddings=embeddings)
