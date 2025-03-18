# FastAPI 서버 실행
from fastapi import FastAPI
from app.api.food_log import router as food_log_router
from app.api.ingredient import router as ingredient_router
from app.api.dbtest import router as dbtest_router

app = FastAPI()

# API 라우터 등록
app.include_router(food_log_router, prefix="/llm")
app.include_router(ingredient_router, prefix="/llm")
app.include_router(dbtest_router, prefix="/test")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
