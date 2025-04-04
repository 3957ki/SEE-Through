import os
import glob
from deepface import DeepFace


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


# 사용 예시
if __name__ == "__main__":
    db_path = "dataset"
    model = "Facenet512"
    detector_backend = "retinaface"

    # register_all_users(db_path, model, detector_backend)
