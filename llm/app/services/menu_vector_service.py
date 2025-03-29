from sqlalchemy.orm import Session
from datetime import datetime
from app.db.models import MenuVector
from app.core.embedding import get_embedding


def insert_menu_vectors_service(names: list[str], db: Session) -> tuple[int, list[str]]:
    success_count = 0
    failed_names = []

    for name in names:
        # 중복 체크: 이미 같은 name이 존재하면 패스
        exists = db.query(MenuVector).filter(MenuVector.name == name).first()
        if exists:
            failed_names.append(name)
            continue

        try:
            embedding = get_embedding(name)
            vector_entry = MenuVector(
                name=name, embedding=embedding, created_at=datetime.utcnow()
            )
            db.add(vector_entry)
            success_count += 1
        except Exception as e:
            failed_names.append(name)
            continue

    db.commit()
    return success_count, failed_names
