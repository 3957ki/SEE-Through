import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# 환경 변수 로드 (.env 파일)
load_dotenv()

# DB 연결 정보
DATABASE_URL = os.getenv("DB_URL")
print("DATABASE_URL: ",DATABASE_URL)
if not DATABASE_URL:
    raise ValueError("DB_URL 환경 변수가 설정되지 않았습니다.")

# SQLAlchemy 엔진 생성
engine = create_engine(DATABASE_URL)

# 데이터베이스 세션 생성 (FastAPI 의존성 주입에 사용)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 베이스 클래스 (모델 정의 시 상속받음)
Base = declarative_base()

def get_db():
    """
    FastAPI 의존성 주입용 DB 세션 생성 함수
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
