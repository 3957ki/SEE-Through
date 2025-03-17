from langchain_openai import OpenAIEmbeddings
from core.config import OPENAI_API_KEY

# OpenAI 임베딩 모델 로드
embedding_model = OpenAIEmbeddings(openai_api_key=OPENAI_API_KEY, model="text-embedding-3-small")

def get_embedding(text: str):
    """텍스트를 벡터로 변환"""
    return embedding_model.embed_query(text)
