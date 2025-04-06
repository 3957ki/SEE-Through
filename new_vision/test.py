import os
import glob
import pandas as pd
import numpy as np
import shutil
from deepface import DeepFace
from sklearn.metrics import (
    confusion_matrix,
    accuracy_score,
    precision_score,
    recall_score,
)


def delete(db_path):
    # 데이터셋 폴더 내 각 인물(하위 폴더) 순회
    image_extensions = (".jpg", ".jpeg", ".png", ".bmp", ".gif")
    for folder in os.listdir(db_path):
        folder_path = os.path.join(db_path, folder)
        if os.path.isdir(folder_path):
            # 해당 폴더 내 이미지 파일 목록 생성
            images = [
                f
                for f in os.listdir(folder_path)
                if f.lower().endswith(image_extensions)
            ]
            # 이미지 파일이 1개뿐인 경우 폴더 삭제
            if len(images) == 1:
                print(f"Deleting folder: {folder_path}")
                shutil.rmtree(folder_path)


def register_all_users(db_path, model, detector_backend):

    # 데이터셋 폴더 내의 모든 사용자 폴더 가져오기
    user_folders = [
        f for f in os.listdir(db_path) if os.path.isdir(os.path.join(db_path, f))
    ]

    total_users = len(user_folders)
    registered_images = 0

    print(f"총 {total_users}명의 사용자를 등록합니다.")

    # 각 사용자 폴더 처리
    for i, user_id in enumerate(user_folders, 1):
        user_folder = os.path.join(db_path, user_id)

        # 지원하는 이미지 파일 확장자
        image_extensions = ["*.jpg", "*.jpeg", "*.png", "*.bmp"]
        image_files = []

        # 모든 이미지 파일 수집
        for ext in image_extensions:
            image_files.extend(glob.glob(os.path.join(user_folder, ext)))

        print(
            f"[{i}/{total_users}] 사용자 '{user_id}' 등록 중... (이미지 {len(image_files)}개)"
        )

        # 각 이미지 등록
        for j, image_path in enumerate(image_files, 1):
            try:
                DeepFace.update(
                    user_id=user_id,
                    image_path=image_path,
                    db_path=db_path,
                    model_name=model,
                    detector_backend=detector_backend,
                    silent=True,
                )
                registered_images += 1
                if j % 5 == 0:  # 5개마다 진행 상황 출력
                    print(f"  - {j}/{len(image_files)} 이미지 처리 완료")
            except Exception as e:
                print(f"  - 오류 발생: {image_path} - {str(e)}")

        print(f"  - 사용자 '{user_id}' 등록 완료!")

    print(
        f"\n등록 완료! 총 {total_users}명의 사용자, {registered_images}개의 이미지가 등록되었습니다."
    )


def test_start(db_path, model, detector_backend):
    # 결과 저장용 리스트
    true_labels = []
    pred_labels = []

    # 테스트 데이터셋 순회: 폴더명이 실제 라벨(인물명)으로 가정
    for person in os.listdir(db_path):
        person_dir = os.path.join(db_path, person)
        if not os.path.isdir(person_dir):
            continue
        for img_file in os.listdir(person_dir):
            img_path = os.path.join(person_dir, img_file)

            # 얼굴 인식 및 매칭 수행
            result = DeepFace.find(
                img_path=img_path,
                db_path=db_path,
                model_name=model,
                detector_backend=detector_backend,
                silent=True,
                threshold=0.37,
            )

            # result는 리스트로 반환되며, 첫번째 요소는 pandas DataFrame입니다.
            # DataFrame이 비어있지 않다면 첫번째 결과의 identity 컬럼에서 인물명을 추출합니다.
            if result and len(result[0]) > 1:
                # 파일 경로 예시: 'db_path/person_name/image.jpg'
                predicted_person = result[0].iloc[1]["identity"]
            else:
                # 매칭 결과가 없으면 'unknown' 또는 원하는 미분류 라벨 사용
                predicted_person = "unknown"

            true_labels.append(person)
            pred_labels.append(predicted_person)
            print(f"정답: {person} 예측: {predicted_person}")

    # 모든 이미지에 대한 예측 결과를 이용해 혼동 행렬과 통계 계산
    labels = sorted(list(set(true_labels + pred_labels)))
    cm = confusion_matrix(true_labels, pred_labels, labels=labels)
    acc = accuracy_score(true_labels, pred_labels)
    prec = precision_score(
        true_labels, pred_labels, average="weighted", zero_division=0
    )
    rec = recall_score(true_labels, pred_labels, average="weighted", zero_division=0)

    print("Confusion Matrix:")
    print(pd.DataFrame(cm, index=labels, columns=labels))
    print(f"\nAccuracy: {acc:.4f}")
    print(f"Precision: {prec:.4f}")
    print(f"Recall: {rec:.4f}")


# 사용 예시
if __name__ == "__main__":
    db_path = "dataset"
    model = "Facenet512"
    detector_backend = "retinaface"

    # delete(db_path)
    # register_all_users(db_path, model, detector_backend)
    test_start(db_path, model, detector_backend)
