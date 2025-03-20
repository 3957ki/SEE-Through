from pydantic import BaseModel

class CommentResponse(BaseModel):
    ingredient_id: str
    name: str
    category: int
    category_name: str
    comment: str

