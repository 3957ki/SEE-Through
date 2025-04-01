from sqlalchemy.orm import Session
from datetime import datetime
from sqlalchemy.exc import SQLAlchemyError
from app.db.models import MenuVector
from app.core.embedding import get_embedding


def insert_menu_vectors_service(
    names: list[str], db: Session, batch_size: int = 20
) -> tuple[int, list[str]]:
    success_count = 0
    failed_names = []
    to_save_batch = []

    # 미리 DB에서 중복된 이름 조회
    existing_names = {
        row.name
        for row in db.query(MenuVector.name).filter(MenuVector.name.in_(names)).all()
    }

    for name in names:
        if name in existing_names:
            failed_names.append(name)
            continue

        try:
            embedding = get_embedding(name)
            vector_entry = MenuVector(
                name=name, embedding=embedding, created_at=datetime.utcnow()
            )
            to_save_batch.append(vector_entry)
        except Exception as e:
            failed_names.append(name)

        # 배치 저장
        if len(to_save_batch) >= batch_size:
            try:
                db.bulk_save_objects(to_save_batch)
                db.commit()
                success_count += len(to_save_batch)
                to_save_batch.clear()
            except SQLAlchemyError as e:
                db.rollback()
                failed_names.extend([v.name for v in to_save_batch])
                to_save_batch.clear()

    # 마지막 배치 저장
    if to_save_batch:
        try:
            db.bulk_save_objects(to_save_batch)
            db.commit()
            success_count += len(to_save_batch)
        except SQLAlchemyError:
            db.rollback()
            failed_names.extend([v.name for v in to_save_batch])

    return success_count, failed_names
