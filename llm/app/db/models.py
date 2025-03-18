from sqlalchemy import Column, Integer, String, DateTime
from db.database import Base

class FoodLog(Base):
    __tablename__ = "food_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    member_id = Column(String, index=True)
    ingredient_id = Column(String)
    food = Column(String)
    date = Column(DateTime)
    