import os
import shutil
import time
import numpy as np
import pandas as pd
from deepface import DeepFace


def delete_small_folders(dataset_path):
    for person_folder in os.listdir(dataset_path):
        person_path = os.path.join(dataset_path, person_folder)

        if os.path.isdir(person_path):
            files = [
                f
                for f in os.listdir(person_path)
                if os.path.isfile(os.path.join(person_path, f))
            ]

            if len(files) <= 1:
                shutil.rmtree(person_path)
                print(f"Deleted folder: {person_path}")


def move_first_image(dataset_path, register_dataset_path):
    os.makedirs(register_dataset_path, exist_ok=True)

    for person_folder in os.listdir(dataset_path):
        person_path = os.path.join(dataset_path, person_folder)
        register_person_path = os.path.join(register_dataset_path, person_folder)

        if os.path.isdir(person_path):
            files = sorted(
                [
                    f
                    for f in os.listdir(person_path)
                    if os.path.isfile(os.path.join(person_path, f))
                ]
            )

            if files:
                os.makedirs(register_person_path, exist_ok=True)
                first_image_path = os.path.join(person_path, files[0])
                target_path = os.path.join(register_person_path, files[0])
                shutil.move(first_image_path, target_path)
                print(f"Moved {first_image_path} -> {target_path}")


def register_users(register_dataset_path, db_path):
    detector_backend = "retinaface"
    model = "Facenet"

    for person_folder in os.listdir(register_dataset_path):
        person_path = os.path.join(register_dataset_path, person_folder)

        if os.path.isdir(person_path):
            files = [
                f
                for f in os.listdir(person_path)
                if os.path.isfile(os.path.join(person_path, f))
            ]

            for file in files:
                file_path = os.path.join(person_path, file)
                user_id = person_folder

                DeepFace.update(
                    user_id=user_id,
                    image_path=file_path,
                    db_path=db_path,
                    model_name=model,
                    detector_backend=detector_backend,
                    silent=True,
                )
                print(f"Registered {user_id} with {file_path}")


def test_recognition_performance(
    dataset_path, db_path, failed_log_path="failed_images.txt"
):
    detector_backend = "retinaface"
    model = "Facenet"
    total_images = 0
    correct_matches = 0
    processing_times = []
    failed_images = []

    for person_folder in os.listdir(dataset_path):
        person_path = os.path.join(dataset_path, person_folder)

        if os.path.isdir(person_path):
            files = [
                f
                for f in os.listdir(person_path)
                if os.path.isfile(os.path.join(person_path, f))
            ]

            for file in files:
                file_path = os.path.join(person_path, file)
                total_images += 1
                start_time = time.time()
                try:
                    dfs = DeepFace.find(
                        img_path=file_path,
                        db_path=db_path,
                        model_name=model,
                        detector_backend=detector_backend,
                    )
                    elapsed_time = time.time() - start_time
                    processing_times.append(elapsed_time)

                    if isinstance(dfs, list) and len(dfs) > 0 and not dfs[0].empty:
                        df = dfs[0]
                        identities = df["identity"].tolist()
                        detected_persons = [
                            os.path.basename(os.path.dirname(identity))
                            for identity in identities
                        ]

                        if person_folder in detected_persons:
                            correct_matches += 1
                            print(
                                f"Correctly identified {file_path} as {person_folder}"
                            )
                        else:
                            print(f"Failed to identify {file_path} correctly")
                            failed_images.append(file_path)
                    else:
                        print(f"No match found for {file_path}")
                        failed_images.append(file_path)
                except Exception as e:
                    print(f"Error processing {file_path}: {str(e)}")
                    failed_images.append(file_path)

    # 결과 요약 출력
    accuracy = (correct_matches / total_images) * 100 if total_images > 0 else 0
    avg_time = np.mean(processing_times) if processing_times else 0

    print(f"Recognition Accuracy: {accuracy:.2f}%")
    print(f"Average Processing Time: {avg_time:.4f} seconds per image")

    # 실패 이미지 저장
    if failed_images:
        with open(failed_log_path, "w") as f:
            for path in failed_images:
                f.write(path + "\n")
        print(f"Failed image paths written to {failed_log_path}")
    else:
        print("All images were successfully recognized.")


def test(img_path, db_path):
    dfs = DeepFace.find(
        img_path=img_path,
        db_path=db_path,
        model_name="Facenet",
        detector_backend="retinaface",
    )
    # 결과 변환
    if isinstance(dfs, list) and len(dfs) > 0 and not dfs[0].empty:  # 기존 사용자 응답
        df = dfs[0]
        result = df.applymap(
            lambda x: int(x) if isinstance(x, (np.int64, np.int32)) else x
        ).to_dict(orient="records")
        print(result)

    else:  # 신규 사용자 등록
        print(False)


dataset_path = "dataset"
register_dataset_path = "register_dataset"
db_path = "users"

delete_small_folders(dataset_path)
move_first_image(dataset_path, register_dataset_path)
# register_users(register_dataset_path, db_path)
test_recognition_performance(dataset_path=register_dataset_path, db_path=dataset_path)
