import pickle

# 원본 pickle 파일 경로
input_pickle_path = "users/ds_model_facenet512_detector_retinaface_aligned_normalization_base_expand_0.pkl"


# 수정된 pickle 파일 저장 경로
output_pickle_path = "users/ds_model_facenet512_detector_retinaface_aligned_normalization_base_expand_0.pkl"


# 바꾸고 싶은 원래 identity와 새로운 identity
old_identity = ""  # 바꿀 새로생긴 uuid 넣기
new_identity = ""  # DB에 있는 우리 dummy uuid 넣기

# pickle 파일 로드
with open(input_pickle_path, "rb") as f:
    data = pickle.load(f)

# identity 변경
for entry in data:
    if entry.get("identity") == old_identity:
        entry["identity"] = new_identity
        print(f"Changed identity from {old_identity} to {new_identity}")

# 변경된 결과 저장
with open(output_pickle_path, "wb") as f:
    pickle.dump(data, f)

print(f"Updated pickle saved to {output_pickle_path}")
