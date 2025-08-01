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
model = "Facenet512"
db_path = "users"


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
    allow_origins=["*"],  # 모든 origin 허용
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)


# 이미지 저장 함수
def save_image(face_region, temp_file_path, user_image_path, padding_ratio=0.5):
    try:
        original_image = Image.open(temp_file_path)
        width, height = original_image.size

        x1, y1, x2, y2 = face_region
        face_width = x2 - x1
        face_height = y2 - y1

        pad_w = int(face_width * padding_ratio)
        pad_h = int(face_height * padding_ratio)

        x1 = max(0, x1 - pad_w)
        y1 = max(0, y1 - pad_h)
        x2 = min(width, x2 + pad_w)
        y2 = min(height, y2 + pad_h)

        cropped_face = original_image.crop((x1, y1, x2, y2))
        cropped_face.save(user_image_path, format="JPEG")
    except Exception as e:
        logger.warning(f"얼굴 이미지 자르기 실패: {e}, 원본 이미지 저장")
        shutil.move(temp_file_path, user_image_path)


# 얼굴 인식 API
@vision_router.websocket("/find-faces")
async def websocket_find_faces(websocket: WebSocket):
    try:
        await websocket.accept()
        while True:
            try:
                # 메시지를 JSON 형태로 받음
                data = await websocket.receive_json()
                image_base64 = data.get("image")
                level = data.get("level")  # 얼굴 인식 단계
                provided_uuid = data.get("uuid")  # 프론트에 현재 UUID가 있다면 IOU 크기가 작을 때 UUID를 담을 것, 현재 UUID가 없다면 담으면 안됨

                logger.info(f"얼굴 인식 요청 level: {level} uuid: {provided_uuid}")

                # Base64 디코딩하여 이미지 변환
                image_data = base64.b64decode(image_base64)
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
                        silent=True,
                        threshold=0.3,
                    )

                    result = []
                    is_new = False

                    # level이 1이라면 인식 실패시 신규 등록 안함
                    if level == 1:
                        # 인식 결과가 있다면
                        if isinstance(dfs, list) and len(dfs) > 0 and not dfs[0].empty:
                            df = dfs[0]
                            result = df.applymap(
                                lambda x: (
                                    int(x) if isinstance(x, (np.int64, np.int32)) else x
                                )
                            ).to_dict(orient="records")
                            user_id = result[0]["identity"]
                            is_new = False

                        # 인식 결과가 없다면 None
                        else:
                            user_id = None
                            is_new = False

                    # level이 1이 아니라면 인식 실패시 신규 등록 해야함
                    else:
                        # 인식 결과가 있다면
                        if isinstance(dfs, list) and len(dfs) > 0 and not dfs[0].empty:
                            df = dfs[0]
                            result = df.applymap(
                                lambda x: (
                                    int(x) if isinstance(x, (np.int64, np.int32)) else x
                                )
                            ).to_dict(orient="records")
                            detected_uuid = result[0]["identity"]

                            # uuid가 있다면
                            if provided_uuid:
                                # uuid가 같다면 강제로 신규 등록
                                if provided_uuid == detected_uuid:
                                    logger.info("uuid가 같음")
                                    user_id = str(uuid.uuid4())
                                    is_new = True

                                    new_rep = DeepFace.update(
                                        user_id=user_id,
                                        image_path=temp_file_path,
                                        db_path=db_path,
                                        model_name=model,
                                        detector_backend=detector_backend,
                                        silent=True,
                                    )

                                    # 이미지 저장 경로
                                    user_image_path = os.path.join(
                                        db_path, f"{user_id}.jpg"
                                    )

                                    # 얼굴 이미지 자르기
                                    face_region = (
                                        new_rep["facial_area"]["x"],
                                        new_rep["facial_area"]["y"],
                                        new_rep["facial_area"]["x"]
                                        + new_rep["facial_area"]["w"],
                                        new_rep["facial_area"]["y"]
                                        + new_rep["facial_area"]["h"],
                                    )

                                    # 이미지 저장 요청
                                    save_image(face_region, temp_file_path, user_image_path)

                                    result = [{"identity": user_id}]

                                # 다른 사람, 기존 인식 결과만 반환
                                else:
                                    user_id = detected_uuid
                                    is_new = False

                            # uuid가 없는 경우: 기존 사용자로 응답
                            else:
                                user_id = detected_uuid
                                is_new = False

                        # 인식 결과가 없다면
                        else:
                            logger.info("인식 결과 없음")
                            user_id = provided_uuid if provided_uuid else str(uuid.uuid4())
                            is_new = True

                            new_rep = DeepFace.update(
                                user_id=user_id,
                                image_path=temp_file_path,
                                db_path=db_path,
                                model_name=model,
                                detector_backend=detector_backend,
                                silent=True,
                            )

                            # 이미지 저장 경로
                            user_image_path = os.path.join(db_path, f"{user_id}.jpg")

                            # 얼굴 이미지 자르기
                            face_region = (
                                new_rep["facial_area"]["x"],
                                new_rep["facial_area"]["y"],
                                new_rep["facial_area"]["x"] + new_rep["facial_area"]["w"],
                                new_rep["facial_area"]["y"] + new_rep["facial_area"]["h"],
                            )

                            # 이미지 저장
                            save_image(face_region, temp_file_path, user_image_path)

                            result = [{"identity": user_id}]

                    await websocket.send_json({"result": result, "is_new": is_new})

                except Exception as e:
                    logger.error(f"예외 발생: {str(e)}\n{traceback.format_exc()}")
                    await websocket.send_json({"status": "error", "message": str(e)})

            except Exception as e:
                logger.error(f"Error processing message: {e}")
                await websocket.send_json({"status": "error", "message": str(e)})
    except Exception as e:
        logger.error(f"WebSocket connection error: {e}")
        if not websocket.client_state.disconnected:
            await websocket.close()


# 사용자 얼굴 이미지 Get
@vision_router.get("/get-faces")
async def get_faces(user_id: str):
    # 사용자 이미지 경로 설정
    user_image_path = os.path.join(db_path, f"{user_id}.jpg")

    # 파일 존재 여부 확인
    if not os.path.exists(user_image_path):
        raise HTTPException(status_code=404, detail="User image not found")

    # 이미지 파일 응답
    return FileResponse(user_image_path, media_type="image/jpeg")


# WebSocket 연결을 위한 CORS 설정
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    try:
        await websocket.accept()
        # WebSocket 연결 처리
        while True:
            data = await websocket.receive_text()
            # 여기에 WebSocket 메시지 처리 로직 추가
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        await websocket.close()


# 기존 라우터 등록
app.include_router(vision_router)
