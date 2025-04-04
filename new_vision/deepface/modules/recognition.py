# built-in dependencies
import os
import pickle
from typing import List, Union, Optional, Dict, Any, Set
import time

# 3rd party dependencies
import numpy as np
import pandas as pd
from tqdm import tqdm

# project dependencies
from deepface.commons import image_utils
from deepface.modules import representation, detection, verification
from deepface.commons.logger import Logger

logger = Logger()


def find(
    img_path: Union[str, np.ndarray],
    db_path: str,
    model_name: str = "VGG-Face",
    distance_metric: str = "cosine",
    enforce_detection: bool = True,
    detector_backend: str = "opencv",
    align: bool = True,
    expand_percentage: int = 0,
    threshold: Optional[float] = None,
    normalization: str = "base",
    silent: bool = False,
    anti_spoofing: bool = False,
    batched: bool = False,
) -> Union[List[pd.DataFrame], List[List[Dict[str, Any]]]]:

    tic = time.time()

    if not os.path.isdir(db_path):
        raise ValueError(f"Passed path {db_path} does not exist!")

    img, _ = image_utils.load_image(img_path)
    if img is None:
        raise ValueError(f"Passed image path {img_path} does not exist!")

    file_parts = [
        "ds",
        "model",
        model_name,
        "detector",
        detector_backend,
        "aligned" if align else "unaligned",
        "normalization",
        normalization,
        "expand",
        str(expand_percentage),
    ]

    file_name = "_".join(file_parts) + ".pkl"
    file_name = file_name.replace("-", "").lower()

    datastore_path = os.path.join(db_path, file_name)
    representations = []

    # required columns for representations
    df_cols = {"identity", "embedding", "facial_area", "count"}

    # Ensure the proper pickle file exists
    if not os.path.exists(datastore_path):
        with open(datastore_path, "wb") as f:
            pickle.dump([], f, pickle.HIGHEST_PROTOCOL)

    # Load the representations from the pickle file
    with open(datastore_path, "rb") as f:
        representations = pickle.load(f)

    # check each item of representations list has required keys
    for i, current_representation in enumerate(representations):
        missing_keys = df_cols - set(current_representation.keys())
        if len(missing_keys) > 0:
            raise ValueError(
                f"{i}-th item does not have some required keys - {missing_keys}."
                f"Consider to delete {datastore_path}"
            )

    # Should we have no representations bailout
    if len(representations) == 0:
        if not silent:
            toc = time.time()
            logger.info(f"find function duration {toc - tic} seconds")
        return []
    df = pd.DataFrame(representations)
    # ----------------------------

    resp_obj = []

    target_embedding_obj = representation.represent(
        img_path=img_path,
        model_name=model_name,
        enforce_detection=enforce_detection,
        detector_backend=detector_backend,
        align=align,
        normalization=normalization,
    )
    source_region = target_embedding_obj["facial_area"]

    target_representation = target_embedding_obj["embedding"]

    result_df = df.copy()  # df will be filtered in each img
    result_df["source_x"] = source_region["x"]
    result_df["source_y"] = source_region["y"]
    result_df["source_w"] = source_region["w"]
    result_df["source_h"] = source_region["h"]

    distances = []
    for _, instance in df.iterrows():
        source_representation = instance["embedding"]
        if source_representation is None:
            distances.append(float("inf"))  # no representation for this image
            continue

        target_dims = len(list(target_representation))
        source_dims = len(list(source_representation))
        if target_dims != source_dims:
            raise ValueError(
                "Source and target embeddings must have same dimensions but "
                + f"{target_dims}:{source_dims}. Model structure may change"
                + " after pickle created. Delete the {file_name} and re-run."
            )

        distance = verification.find_distance(
            source_representation, target_representation, distance_metric
        )

        distances.append(distance)
    target_threshold = threshold or verification.find_threshold(
        model_name, distance_metric
    )

    result_df["threshold"] = target_threshold
    result_df["distance"] = distances

    result_df = result_df.drop(columns=["embedding"])
    result_df = result_df[result_df["distance"] <= target_threshold]
    result_df = result_df.sort_values(by=["distance"], ascending=True).reset_index(
        drop=True
    )

    resp_obj.append(result_df)

    # -----------------------------------

    return resp_obj


def update(
    user_id: str,
    image_path: str,
    db_path: str,
    model_name: str = "VGG-Face",
    enforce_detection: bool = True,
    detector_backend: str = "opencv",
    align: bool = True,
    expand_percentage: int = 0,
    normalization: str = "base",
    silent: bool = False,
):

    tic = time.time()

    if not os.path.isdir(db_path):
        raise ValueError(f"Passed path {db_path} does not exist!")

    file_parts = [
        "ds",
        "model",
        model_name,
        "detector",
        detector_backend,
        "aligned" if align else "unaligned",
        "normalization",
        normalization,
        "expand",
        str(expand_percentage),
    ]

    file_name = "_".join(file_parts) + ".pkl"
    file_name = file_name.replace("-", "").lower()

    datastore_path = os.path.join(db_path, file_name)
    representations = []

    # required columns for representations
    df_cols = {"identity", "embedding", "facial_area", "count"}

    # Ensure the proper pickle file exists
    if not os.path.exists(datastore_path):
        with open(datastore_path, "wb") as f:
            pickle.dump([], f, pickle.HIGHEST_PROTOCOL)

    # Load the representations from the pickle file
    with open(datastore_path, "rb") as f:
        representations = pickle.load(f)

    # check each item of representations list has required keys
    for i, current_representation in enumerate(representations):
        missing_keys = df_cols - set(current_representation.keys())
        if len(missing_keys) > 0:
            raise ValueError(
                f"{i}-th item does not have some required keys - {missing_keys}."
                f"Consider to delete {datastore_path}"
            )

    new_representation = representation.represent(
        img_path=image_path,
        model_name=model_name,
        enforce_detection=enforce_detection,
        detector_backend=detector_backend,
        align=align,
        normalization=normalization,
    )

    representations.append(
        {
            "identity": user_id,
            "embedding": new_representation["embedding"],
            "facial_area": new_representation["facial_area"],
            "count": 0,
        }
    )

    with open(datastore_path, "wb") as f:
        pickle.dump(representations, f, pickle.HIGHEST_PROTOCOL)

    # Should we have no representations bailout
    if len(representations) == 0:
        if not silent:
            toc = time.time()
            logger.info(f"find function duration {toc - tic} seconds")
        return []

    return new_representation


def find_batched(
    representations: List[Dict[str, Any]],
    source_objs: List[Dict[str, Any]],
    model_name: str = "VGG-Face",
    distance_metric: str = "cosine",
    enforce_detection: bool = True,
    align: bool = True,
    threshold: Optional[float] = None,
    normalization: str = "base",
    anti_spoofing: bool = False,
) -> List[List[Dict[str, Any]]]:
    """
    Perform batched face recognition by comparing source face embeddings with a set of
    target embeddings. It calculates pairwise distances between the source and target
    embeddings using the specified distance metric.
    The function uses batch processing for efficient computation of distances.

    Args:
        representations (List[Dict[str, Any]]):
            A list of dictionaries containing precomputed target embeddings and associated metadata.
            Each dictionary should have at least the key `embedding`.

        source_objs (List[Dict[str, Any]]):
            A list of dictionaries representing the source images to compare against
            the target embeddings. Each dictionary should contain:
                - `face`: The image data or path to the source face image.
                - `facial_area`: A dictionary with keys `x`, `y`, `w`, `h`
                   indicating the facial region.
                - Optionally, `is_real`: A boolean indicating if the face is real
                  (used for anti-spoofing).

        model_name (str): Model for face recognition. Options: VGG-Face, Facenet, Facenet512,
            OpenFace, DeepFace, DeepID, Dlib, ArcFace, SFace and GhostFaceNet (default is VGG-Face).

        distance_metric (string): Metric for measuring similarity. Options: 'cosine',
            'euclidean', 'euclidean_l2'.

        enforce_detection (boolean): If no face is detected in an image, raise an exception.
            Default is True. Set to False to avoid the exception for low-resolution images.

        detector_backend (string): face detector backend. Options: 'opencv', 'retinaface',
            'mtcnn', 'ssd', 'dlib', 'mediapipe', 'yolov8', 'yolov11n', 'yolov11s',
            'yolov11m', 'centerface' or 'skip'.

        align (boolean): Perform alignment based on the eye positions.

        threshold (float): Specify a threshold to determine whether a pair represents the same
            person or different individuals. This threshold is used for comparing distances.
            If left unset, default pre-tuned threshold values will be applied based on the specified
            model name and distance metric (default is None).

        normalization (string): Normalize the input image before feeding it to the model.
            Default is base. Options: base, raw, Facenet, Facenet2018, VGGFace, VGGFace2, ArcFace

        silent (boolean): Suppress or allow some log messages for a quieter analysis process.

        anti_spoofing (boolean): Flag to enable anti spoofing (default is False).

    Returns:
        List[List[Dict[str, Any]]]:
            A list where each element corresponds to a source face and
            contains a list of dictionaries with matching faces.
    """
    embeddings_list = []
    valid_mask = []
    metadata = set()

    for item in representations:
        emb = item.get("embedding")
        if emb is not None:
            embeddings_list.append(emb)
            valid_mask.append(True)
        else:
            embeddings_list.append(np.zeros_like(representations[0]["embedding"]))
            valid_mask.append(False)

        metadata.update(item.keys())

    # remove embedding key from other keys
    metadata.discard("embedding")
    metadata = list(metadata)

    embeddings = np.array(embeddings_list)  # (N, D)
    valid_mask = np.array(valid_mask)  # (N,)

    data = {
        key: np.array([item.get(key, None) for item in representations])
        for key in metadata
    }

    target_embeddings = []
    source_regions = []
    target_thresholds = []

    for source_obj in source_objs:
        if anti_spoofing and not source_obj.get("is_real", True):
            raise ValueError("Spoof detected in the given image.")

        source_img = source_obj["face"]
        source_region = source_obj["facial_area"]

        target_embedding_obj = representation.represent(
            img_path=source_img,
            model_name=model_name,
            enforce_detection=enforce_detection,
            detector_backend="skip",
            align=align,
            normalization=normalization,
        )
        # it is safe to access 0 index because we already fed detected face to represent function
        target_representation = target_embedding_obj[0]["embedding"]

        target_embeddings.append(target_representation)
        source_regions.append(source_region)

        target_threshold = threshold or verification.find_threshold(
            model_name, distance_metric
        )
        target_thresholds.append(target_threshold)

    target_embeddings = np.array(target_embeddings)  # (M, D)
    target_thresholds = np.array(target_thresholds)  # (M,)
    source_regions_arr = {
        "source_x": np.array([region["x"] for region in source_regions]),
        "source_y": np.array([region["y"] for region in source_regions]),
        "source_w": np.array([region["w"] for region in source_regions]),
        "source_h": np.array([region["h"] for region in source_regions]),
    }

    distances = verification.find_distance(
        embeddings, target_embeddings, distance_metric
    )  # (M, N)
    distances[:, ~valid_mask] = np.inf

    resp_obj = []

    for i in range(len(target_embeddings)):
        target_distances = distances[i]  # (N,)
        target_threshold = target_thresholds[i]

        N = embeddings.shape[0]
        result_data = dict(data)
        result_data.update(
            {
                "source_x": np.full(N, source_regions_arr["source_x"][i]),
                "source_y": np.full(N, source_regions_arr["source_y"][i]),
                "source_w": np.full(N, source_regions_arr["source_w"][i]),
                "source_h": np.full(N, source_regions_arr["source_h"][i]),
                "threshold": np.full(N, target_threshold),
                "distance": target_distances,
            }
        )

        mask = target_distances <= target_threshold
        filtered_data = {key: value[mask] for key, value in result_data.items()}

        sorted_indices = np.argsort(filtered_data["distance"])
        sorted_data = {
            key: value[sorted_indices] for key, value in filtered_data.items()
        }

        num_results = len(sorted_data["distance"])
        result_dicts = [
            {key: sorted_data[key][i] for key in sorted_data}
            for i in range(num_results)
        ]
        resp_obj.append(result_dicts)
    return resp_obj
