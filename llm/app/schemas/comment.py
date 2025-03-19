from pydantic import BaseModel

class CommentResponse(BaseModel):
    ingredient_id: str
    name: str
    comment: str
