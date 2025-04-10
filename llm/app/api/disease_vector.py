from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.disease_vector import (
    DiseaseVectorInsertRequest,
    DiseaseVectorInsertResponse,
)
from app.services.disease_vector_service import insert_disease_vectors_service

router = APIRouter()


@router.post("/disease-vectors", response_model=DiseaseVectorInsertResponse)
async def insert_disease_vectors(
    request: DiseaseVectorInsertRequest, db: Session = Depends(get_db)
):
    success_count, failed_items = insert_disease_vectors_service(request.items, db)
    return DiseaseVectorInsertResponse(
        success_count=success_count, failed_items=failed_items
    )
