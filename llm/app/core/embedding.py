from langchain_openai import OpenAIEmbeddings
from app.core.config import OPENAI_API_KEY

# OpenAI 임베딩 모델 로드
embedding_model = OpenAIEmbeddings(
    openai_api_key=OPENAI_API_KEY, model="text-embedding-3-small"
)


def get_embedding(text: str):
    """텍스트를 벡터로 변환"""
    return embedding_model.embed_query(text)


def get_embeddings(texts: list[str]) -> list[list[float]]:
    from openai import OpenAI

    client = OpenAI(api_key=OPENAI_API_KEY)

    response = client.embeddings.create(
        input=texts, model="text-embedding-3-small"  # 또는 gpt-4-embedding 계열
    )
    return [item.embedding for item in response.data]
