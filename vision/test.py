from deepface import DeepFace
import os
import time
import numpy as np

# 테스트용 코드 (이미지 비교 방식으로 나중에 수정해야함)
detector_backend = "retinaface"
model = "Facenet"


def test_recognition_performance(dataset_path, db_path):
    total_images = 0
    correct_matches = 0
    processing_times = []

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
                        silent=True,
                        threshold=0.3,
                    )
                    elapsed_time = time.time() - start_time
                    processing_times.append(elapsed_time)

                    if isinstance(dfs, list) and len(dfs) > 0 and not dfs[0].empty:
                        df = dfs[0]
                        detected_person = df["identity"].iloc[0]

                        if person_folder in detected_person:
                            correct_matches += 1
                            print(
                                f"Correctly identified {file_path} as {person_folder}"
                            )
                        else:
                            print(f"Failed to identify {file_path} correctly")
                    else:
                        print(f"No match found for {file_path}")
                except Exception as e:
                    print(f"Error processing {file_path}: {str(e)}")

    accuracy = (correct_matches / total_images) * 100 if total_images > 0 else 0
    avg_time = np.mean(processing_times) if processing_times else 0

    print(f"Recognition Accuracy: {accuracy:.2f}%")
    print(f"Average Processing Time: {avg_time:.4f} seconds per image")


dataset_path = "dataset"
register_dataset_path = "register_dataset"
db_path = "users"

test_recognition_performance(dataset_path, db_path)
