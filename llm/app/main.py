# FastAPI 서버 실행
from fastapi import FastAPI
from app.api.food_log import router as food_log_router
from app.api.ingredient import router as ingredient_router
from app.api.risky_check import router as risky_check_router
from app.api.comment import router as comment_router
from app.api.risky_food_by_ingredient import router as risky_food_by_ingredient_router
from app.api.meal_plan import router as meal_plan_router
from app.api.menu_vector import router as menu_vector_router
from app.api.meal_plan_rag import router as meal_plan_rag_router
from app.api.dbtest import router as dbtest_router
import logging

app = FastAPI()

# 로깅 기본 설정
logging.basicConfig(
    level=logging.INFO,  # 로그 레벨: DEBUG, INFO, WARNING, ERROR, CRITICAL
    format="[%(asctime)s] %(levelname)s - %(message)s",
)

# 로그 출력 테스트
logging.info("✅ FastAPI 애플리케이션 시작 전 로깅 설정 완료")


# API 라우터 등록
app.include_router(food_log_router, prefix="/llm")
app.include_router(ingredient_router, prefix="/llm")
app.include_router(risky_check_router, prefix="/llm")
app.include_router(comment_router, prefix="/llm")
app.include_router(risky_food_by_ingredient_router, prefix="/llm")
app.include_router(meal_plan_router, prefix="/llm")
app.include_router(menu_vector_router, prefix="/llm")
app.include_router(meal_plan_rag_router, prefix="/llm")
app.include_router(dbtest_router, prefix="/test")

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
