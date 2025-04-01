from sqlalchemy.orm import Session
from app.db.models import DiseaseVector
from datetime import datetime
from sqlalchemy.exc import SQLAlchemyError
from app.core.embedding import get_embedding
from app.schemas.disease_vector import DiseaseVectorItem


def insert_disease_vectors_service(
    items: list[DiseaseVectorItem], db: Session, batch_size: int = 20
) -> tuple[int, list[DiseaseVectorItem]]:
    success_count = 0
    failed_items = []
    to_save_batch = []

    # 중복 확인 (disease + ingredient)
    existing = db.query(DiseaseVector.disease, DiseaseVector.ingredient).all()
    existing_set = {(d, i) for d, i in existing}

    for item in items:
        if (item.disease, item.ingredient) in existing_set:
            failed_items.append(item)
            continue

        try:
            vector = get_embedding(item.reason)
            entity = DiseaseVector(
                disease=item.disease,
                ingredient=item.ingredient,
                reason=item.reason,
                embedding=vector,
                created_at=datetime.utcnow(),
            )
            to_save_batch.append(entity)
        except Exception:
            failed_items.append(item)

        if len(to_save_batch) >= batch_size:
            try:
                db.bulk_save_objects(to_save_batch)
                db.commit()
                success_count += len(to_save_batch)
                to_save_batch.clear()
            except SQLAlchemyError:
                db.rollback()
                failed_items.extend(to_save_batch)
                to_save_batch.clear()

    if to_save_batch:
        try:
            db.bulk_save_objects(to_save_batch)
            db.commit()
            success_count += len(to_save_batch)
        except SQLAlchemyError:
            db.rollback()
            failed_items.extend(to_save_batch)

    return success_count, failed_items
