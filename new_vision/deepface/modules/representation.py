# built-in dependencies
from typing import Any, Dict, List, Union, Optional, Sequence, IO
from collections import defaultdict

# 3rd party dependencies
import numpy as np

# project dependencies
from deepface.commons import image_utils
from deepface.modules import modeling, detection, preprocessing
from deepface.models.FacialRecognition import FacialRecognition


def represent(
    img_path: Union[
        str, IO[bytes], np.ndarray, Sequence[Union[str, np.ndarray, IO[bytes]]]
    ],
    model_name: str = "VGG-Face",
    enforce_detection: bool = True,
    detector_backend: str = "opencv",
    align: bool = True,
    expand_percentage: int = 0,
    normalization: str = "base",
    anti_spoofing: bool = False,
    max_faces: Optional[int] = 1,
) -> Union[List[Dict[str, Any]], List[List[Dict[str, Any]]]]:

    resp_objs = []

    model: FacialRecognition = modeling.build_model(
        task="facial_recognition", model_name=model_name
    )

    # Handle list of image paths or 4D numpy array
    if isinstance(img_path, list):
        images = img_path
    elif isinstance(img_path, np.ndarray) and img_path.ndim == 4:
        images = [img_path[i] for i in range(img_path.shape[0])]
    else:
        images = [img_path]

    batch_images, batch_regions, batch_confidences, batch_indexes = [], [], [], []

    for idx, single_img_path in enumerate(images):
        # we have run pre-process in verification. so, skip if it is coming from verify.
        target_size = model.input_shape
        if detector_backend != "skip":
            # Images are returned in RGB format.
            img_objs = detection.extract_faces(
                img_path=single_img_path,
                detector_backend=detector_backend,
                grayscale=False,
                enforce_detection=enforce_detection,
                align=align,
                expand_percentage=expand_percentage,
                anti_spoofing=anti_spoofing,
                max_faces=max_faces,
            )
        else:  # skip
            # Try load. If load error, will raise exception internal
            img, _ = image_utils.load_image(single_img_path)

            if len(img.shape) != 3:
                raise ValueError(
                    f"Input img must be 3 dimensional but it is {img.shape}"
                )

            # Convert to RGB format to keep compatability with `extract_faces`.
            img = img[:, :, ::-1]

            # make dummy region and confidence to keep compatibility with `extract_faces`
            img_objs = [
                {
                    "face": img,
                    "facial_area": {
                        "x": 0,
                        "y": 0,
                        "w": img.shape[0],
                        "h": img.shape[1],
                    },
                    "confidence": 0,
                }
            ]
        # ---------------------------------

        if max_faces is not None and max_faces < len(img_objs):
            # sort as largest facial areas come first
            img_objs = sorted(
                img_objs,
                key=lambda img_obj: img_obj["facial_area"]["w"]
                * img_obj["facial_area"]["h"],
                reverse=True,
            )
            # discard rest of the items
            img_objs = img_objs[0:max_faces]

        for img_obj in img_objs:
            if anti_spoofing is True and img_obj.get("is_real", True) is False:
                raise ValueError("Spoof detected in the given image.")

            img = img_obj["face"]

            # rgb to bgr
            img = img[:, :, ::-1]

            region = img_obj["facial_area"]
            confidence = img_obj["confidence"]

            # resize to expected shape of ml model
            img = preprocessing.resize_image(
                img=img,
                # thanks to DeepId (!)
                target_size=(target_size[1], target_size[0]),
            )

            # custom normalization
            img = preprocessing.normalize_input(img=img, normalization=normalization)

            batch_images.append(img)
            batch_regions.append(region)
            batch_confidences.append(confidence)
            batch_indexes.append(idx)

    # Convert list of images to a numpy array for batch processing
    batch_images = np.concatenate(batch_images, axis=0)

    # Forward pass through the model for the entire batch
    embeddings = model.forward(batch_images)

    resp_objs_dict = defaultdict(list)
    for idy, batch_index in enumerate(batch_indexes):
        resp_objs_dict[batch_index].append(
            {
                "embedding": embeddings if len(batch_images) == 1 else embeddings[idy],
                "facial_area": batch_regions[idy],
                "face_confidence": batch_confidences[idy],
            }
        )

    resp_objs = [resp_objs_dict[idx] for idx in range(len(images))]

    return resp_objs[0][0]
