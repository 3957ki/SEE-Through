from sqlalchemy import Column, Integer, String, Boolean, TIMESTAMP, ForeignKey, JSON, Enum
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector
from .database import Base

class Member(Base):
    __tablename__ = "members"

    member_id = Column(String(36), primary_key=True, index=True)
    name = Column(String(15), nullable=False)
    age = Column(Integer, nullable=False)
    preferred_foods = Column(JSON, nullable=False)
    disliked_foods = Column(JSON, nullable=False)
    allergies = Column(JSON, nullable=False)
    is_registered = Column(Boolean, default=False)
    recognition_times = Column(Integer, default=0)
    created_at = Column(TIMESTAMP, nullable=False)
    deleted_at = Column(TIMESTAMP, nullable=True)
    embedding_vector = Column(Vector(1536), nullable=False)

    ingredients = relationship("Ingredient", back_populates="owner")

class Ingredient(Base):
    __tablename__ = "ingredients"

    ingredient_id = Column(String(36), primary_key=True, index=True)
    member_id = Column(String(36), ForeignKey("members.member_id"), nullable=False)
    name = Column(String, nullable=False)
    image_path = Column(String, nullable=False)
    inbound_at = Column(TIMESTAMP, nullable=False)
    expiration_at = Column(TIMESTAMP, nullable=True)
    embedding_vector = Column(Vector(1536), nullable=False)

    owner = relationship("Member", back_populates="ingredients")

class IngredientLog(Base):
    __tablename__ = "ingredient_logs"

    ingredient_log_id = Column(String(36), primary_key=True, index=True)
    member_id = Column(String(36), ForeignKey("members.member_id"), nullable=False)
    ingredient_name = Column(String, nullable=False)
    movement_type = Column(Enum("INBOUND", "OUTBOUND", name="movement_enum"), nullable=False)
    created_at = Column(TIMESTAMP, nullable=False)
    embedding_vector = Column(Vector(1536), nullable=False)