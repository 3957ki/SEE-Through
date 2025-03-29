from sqlalchemy.orm import Session
from app.db.models import MenuVector
from app.core.embedding import get_embedding
from typing import List, Set
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime


def find_abnormal_menus(
    menu_names: List[str], db: Session, threshold: float = 0.78
) -> Set[str]:
    """
    벡터 DB와 비교하여 이상한(비정상적인) 메뉴명을 필터링
    threshold 값은 L2 거리 기준 (작을수록 더 유사)
    """
    abnormal_set = set()

    for name in menu_names:
        try:
            embedding = get_embedding(name)

            # 가장 가까운 벡터와의 거리 계산
            nearest = (
                db.query(MenuVector)
                .order_by(MenuVector.embedding.l2_distance(embedding))
                .limit(1)
                .first()
            )

            if not nearest:
                abnormal_set.add(name)
                continue

            # L2 거리 계산
            distance = (
                sum((x - y) ** 2 for x, y in zip(embedding, nearest.embedding)) ** 0.5
            )

            if distance > (1 - threshold):
                abnormal_set.add(name)

        except Exception as e:
            abnormal_set.add(name)

    return abnormal_set


def save_menu_vectors(
    names: list[str],
    db: Session,
    batch_size: int = 20,
) -> None:
    """
    LLM이 생성한 정상적인 메뉴명을 벡터로 변환 후 DB에 저장하는 함수

    - 이미 저장된 메뉴는 제외
    - 임베딩 실패나 DB 오류는 무시하고 진행
    """
    to_save_batch = []

    # 중복 제거
    existing_names = {
        row.name
        for row in db.query(MenuVector.name).filter(MenuVector.name.in_(names)).all()
    }

    for name in names:
        if name in existing_names:
            continue

        try:
            embedding = get_embedding(name)
            vector = MenuVector(
                name=name,
                embedding=embedding,
                created_at=datetime.utcnow(),
            )
            to_save_batch.append(vector)
        except Exception:
            continue

        # 배치 저장
        if len(to_save_batch) >= batch_size:
            try:
                db.bulk_save_objects(to_save_batch)
                db.commit()
                to_save_batch.clear()
            except SQLAlchemyError:
                db.rollback()
                to_save_batch.clear()

    # 남은 배치 저장
    if to_save_batch:
        try:
            db.bulk_save_objects(to_save_batch)
            db.commit()
        except SQLAlchemyError:
            db.rollback()
