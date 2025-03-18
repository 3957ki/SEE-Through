from fastapi import FastAPI, UploadFile, File, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from deepface import DeepFace
import uvicorn
import numpy as np
import tempfile
import os
import uuid
import time
import base64
from io import BytesIO
from PIL import Image

app = FastAPI()

# CORS 설정 추가
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 모델 설정
detector_backend = "retinaface"
model = "Facenet"
db_path = "users"


# 얼굴 인식 API (HTTP 버전)
@app.post("/find_faces/")
async def find_faces(file: UploadFile = File(...)):
    """
    업로드된 이미지를 분석하여 데이터베이스에서 가장 유사한 얼굴을 찾음
    """

    start_time = time.time()

    # 업로드된 파일을 임시 저장
    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp_file:
        temp_file.write(await file.read())
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

        os.remove(temp_file_path)  # 사용 후 파일 삭제

        # Pandas DataFrame이 반환되면, JSON 변환 전에 Python 기본 타입으로 변환
        if isinstance(dfs, list) and len(dfs) > 0:
            df = dfs[0]  # DeepFace.find()는 리스트 안에 DataFrame을 반환함
            result = df.applymap(
                lambda x: int(x) if isinstance(x, (np.int64, np.int32)) else x
            ).to_dict(orient="records")
        else:
            result = []

        elapsed_time = time.time() - start_time  # 처리 시간 계산
        return {"result": result, "processing_time": elapsed_time}

    except Exception as e:
        return {"status": "error", "message": str(e)}


# 얼굴 인식 API (웹소켓 버전)
@app.websocket("/find_faces/")
async def websocket_find_faces(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()  # Base64 인코딩된 이미지 받기

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
                    silent=True,
                    threshold=0.3,
                )

                os.remove(temp_file_path)  # 사용 후 파일 삭제

                # 결과 변환
                if isinstance(dfs, list) and len(dfs) > 0:
                    df = dfs[0]
                    result = df.applymap(
                        lambda x: int(x) if isinstance(x, (np.int64, np.int32)) else x
                    ).to_dict(orient="records")
                else:
                    result = []

                await websocket.send_json({"result": result})

            except Exception as e:
                await websocket.send_json({"status": "error", "message": str(e)})

    except Exception as e:
        await websocket.send_json({"status": "error", "message": str(e)})


# 웹소켓 목업 API
@app.websocket("/mock/find_faces/")
async def websocket_mock_find_faces(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()  # Base64 인코딩된 이미지 받기

            # 목업 user id
            mock_user_id = "8da14086-f4e5-4285-853c-aec875d4572b"

            await websocket.send_json({"result": [{"identity": mock_user_id}]})

    except Exception as e:
        await websocket.send_json({"status": "error", "message": str(e)})


# 신규 사용자 등록 API
@app.post("/register_user/")
async def register_user_endpoint(file: UploadFile = File(...)):
    """
    업로드된 이미지 파일을 받아 UUID로 생성된 폴더에 저장
    """

    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp_file:
        temp_file.write(await file.read())
        temp_file_path = temp_file.name
    try:
        # UUID로 고유 사용자 ID 생성
        user_id = str(uuid.uuid4())

        DeepFace.update(
            user_id=user_id,
            image_path=temp_file_path,
            db_path=db_path,
            model_name=model,
            detector_backend=detector_backend,
            silent=True,
        )

        os.remove(temp_file_path)

        return {"status": "success", "user_id": user_id}
    except Exception as e:
        return {"status": "error", "message": str(e)}


# 메타데이터 API
@app.post("/analyze_user/")
async def analyze_user_endpoint(file: UploadFile = File(...)):
    """
    사용자 메타데이터 표시
    """

    start_time = time.time()

    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp_file:
        temp_file.write(await file.read())
        temp_file_path = temp_file.name
    try:
        result = DeepFace.analyze(
            img_path=temp_file_path,
            detector_backend=detector_backend,
            actions=("emotion", "age", "gender"),
        )
        os.remove(temp_file_path)

        elapsed_time = time.time() - start_time  # 처리 시간 계산
        return {"result": result, "processing_time": elapsed_time}
    except Exception as e:
        return {"status": "error", "message": str(e)}


if __name__ == "__main__":
    uvicorn.run(
        "face_api:app", host="0.0.0.0", port=9000, reload=True, log_level="debug"
    )
