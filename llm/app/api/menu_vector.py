from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.menu_vector import MenuVectorInsertRequest, MenuVectorInsertResponse
from app.services.menu_vector_service import insert_menu_vectors_service

router = APIRouter()


@router.post("/menu-vectors", response_model=MenuVectorInsertResponse)
async def insert_menu_vectors(
    request: MenuVectorInsertRequest, db: Session = Depends(get_db)
):
    success_count, failed_names = insert_menu_vectors_service(request.names, db)

    return MenuVectorInsertResponse(
        success_count=success_count, failed_names=failed_names
    )
