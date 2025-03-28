from fastapi import FastAPI, WebSocket, HTTPException, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from deepface import DeepFace
import numpy as np
import tempfile
import os
import uuid
import base64
import shutil
from io import BytesIO
from PIL import Image
from deepface.modules import modeling
import logging
import sys
from contextlib import asynccontextmanager
import traceback


# 로그 설정
logger = logging.getLogger("face_api")
logger.setLevel(logging.DEBUG)

# 로그 핸들러 설정 (콘솔 출력)
handler = logging.StreamHandler(sys.stdout)
handler.setFormatter(logging.Formatter("[%(asctime)s] [%(levelname)s] %(message)s"))
logger.addHandler(handler)

# 모델 설정
detector_backend = "retinaface"
model = "Facenet"
db_path = "dataset"


# 앱 시작 시
@asynccontextmanager
async def lifespan(app: FastAPI):
    os.makedirs(db_path, exist_ok=True)

    logger.info("모델 로딩 시작")
    modeling.build_model(task="face_detector", model_name=detector_backend)
    modeling.build_model(task="facial_recognition", model_name=model)
    logger.info("모델 로딩 종료")

    yield  # 앱이 동작하는 동안

    # 앱 종료 시 (필요 시 리소스 정리 가능)
    logger.info("애플리케이션 종료")


vision_router = APIRouter(prefix="/vision")
app = FastAPI(lifespan=lifespan)

# CORS 설정 추가
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 얼굴 인식 API (웹소켓 버전)
@vision_router.websocket("/find_faces/")
async def websocket_find_faces(websocket: WebSocket):

    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()  # Base64 인코딩된 이미지 받기
            logger.info("얼굴 인식 요청")

            # Base64 디코딩하여 이미지 변환
            image_data = base64.b64decode(data)
            image = Image.open(BytesIO(image_data))

            # 임시 파일 저장
            with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp_file:
                image.save(temp_file, format="JPEG")
                temp_file_path = temp_file.name

            try:
                # 얼굴 인식 수행
                dfs = DeepFace.find(
                    img_path=temp_file_path,
                    db_path=db_path,
                    model_name=model,
                    detector_backend=detector_backend,
                )

                # 결과 변환
                if (
                    isinstance(dfs, list) and len(dfs) > 0 and not dfs[0].empty
                ):  # 기존 사용자 응답
                    df = dfs[0]
                    result = df.applymap(
                        lambda x: int(x) if isinstance(x, (np.int64, np.int32)) else x
                    ).to_dict(orient="records")

                else:  # 신규 사용자 등록
                    # # UUID로 고유 사용자 ID 생성
                    # user_id = str(uuid.uuid4())  # 새로운 사용자 ID 생성

                    # DeepFace.update(
                    #     user_id=user_id,
                    #     image_path=temp_file_path,
                    #     db_path=db_path,
                    #     model_name=model,
                    #     detector_backend=detector_backend,
                    #     silent=True,
                    # )
                    result = [{"identity": "1"}]

                await websocket.send_json({"result": result})

            except Exception as e:
                logger.error(f"예외 발생: {str(e)}\n{traceback.format_exc()}")
                await websocket.send_json({"status": "error", "message": str(e)})

    except Exception as e:
        logger.error(f"예외 발생: {str(e)}\n{traceback.format_exc()}")
        await websocket.send_json({"status": "error", "message": str(e)})


# 사용자 얼굴 이미지 Get
@vision_router.get("/get_faces/")
async def get_faces(user_id: str):
    # 사용자 이미지 경로 설정
    user_image_path = os.path.join(db_path, f"{user_id}.jpg")

    # 파일 존재 여부 확인
    if not os.path.exists(user_image_path):
        raise HTTPException(status_code=404, detail="User image not found")

    # 이미지 파일 응답
    return FileResponse(user_image_path, media_type="image/jpeg")


app.include_router(vision_router)
