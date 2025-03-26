from deepface import DeepFace
import os
import time
import numpy as np
from sklearn.metrics import confusion_matrix, classification_report
import seaborn as sns
import matplotlib.pyplot as plt

# 설정값
detector_backend = "retinaface"
model = "Facenet"


def register_users(register_dataset_path, db_path):

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


def test_recognition_performance(dataset_path, db_path):
    total_images = 0
    correct_matches = 0
    processing_times = []
    true_labels = []
    predicted_labels = []

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

                    predicted_label = "Unknown"

                    if isinstance(dfs, list) and len(dfs) > 0 and not dfs[0].empty:
                        df = dfs[0]
                        detected_person_path = df["identity"].iloc[0]
                        predicted_label = os.path.basename(
                            os.path.dirname(detected_person_path)
                        )

                        if person_folder == predicted_label:
                            correct_matches += 1
                            print(
                                f"Correctly identified {file_path} as {predicted_label}"
                            )
                        else:
                            print(
                                f"Incorrectly identified {file_path} as {predicted_label}"
                            )
                    else:
                        print(f"No match found for {file_path}")

                    true_labels.append(person_folder)
                    predicted_labels.append(predicted_label)

                except Exception as e:
                    print(f"Error processing {file_path}: {str(e)}")

    # 정확도 및 평균 처리 시간
    accuracy = (correct_matches / total_images) * 100 if total_images > 0 else 0
    avg_time = np.mean(processing_times) if processing_times else 0

    print(f"\nRecognition Accuracy: {accuracy:.2f}%")
    print(f"Average Processing Time: {avg_time:.4f} seconds per image\n")

    # Confusion Matrix 출력
    print("Classification Report:")
    print(classification_report(true_labels, predicted_labels, zero_division=0))

    cm = confusion_matrix(
        true_labels,
        predicted_labels,
        labels=sorted(set(true_labels + predicted_labels)),
    )
    plt.figure(figsize=(10, 8))
    sns.heatmap(
        cm,
        annot=True,
        fmt="d",
        xticklabels=sorted(set(true_labels + predicted_labels)),
        yticklabels=sorted(set(true_labels + predicted_labels)),
    )
    plt.xlabel("Predicted")
    plt.ylabel("Actual")
    plt.title("Confusion Matrix")
    plt.tight_layout()
    plt.show()


# 경로 설정
dataset_path = "dataset"
register_dataset_path = "register_dataset"
db_path = "users"

# 테스트 실행
register_users(register_dataset_path, db_path)
test_recognition_performance(dataset_path, db_path)
