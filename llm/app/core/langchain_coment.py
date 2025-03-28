from langchain_openai import ChatOpenAI
from langchain.output_parsers import PydanticOutputParser
from langchain.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from app.core.config import OPENAI_API_KEY

# LangChain LLM 객체 생성
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0, openai_api_key=OPENAI_API_KEY)

### 음식 분류 매핑
FOOD_CATEGORY_MAPPING = {
    "경고": (1, "경고"),
    "주의": (2, "주의"),
    "보통": (3, "보통"),
    "추천": (4, "추천"),
    "권장": (5, "권장"),
}


### 코멘트 생성
# JSON 응답을 강제할 스키마 정의
class FoodCommentSchema(BaseModel):
    food_name: str = Field(..., description="현재 섭취하는 음식 이름")
    category_name: str = Field(
        ..., description="음식의 분류 단계 (경고, 주의, 보통, 추천, 권장)"
    )
    comment: str = Field(..., description="사용자 맞춤 코멘트")


# LangChain OutputParser 정의 (LLM 응답을 JSON으로 변환)
parser = PydanticOutputParser(pydantic_object=FoodCommentSchema)

# LLM 프롬프트 템플릿 정의 (OpenAI 응답은 category_name + comment 반환)
prompt_comment = ChatPromptTemplate.from_template(
    """
"{food_name}"을(를) 섭취하려고 합니다.  
사용자의 선호 음식 및 비선호 음식 정보를 분석하여 맞춤형 코멘트를 제공하세요.

1. 사용자의 생일: {birth}
2. 사용자의 질병 정보: {diseases}
3. 선호 음식 목록: {preferred_foods}
4. 비선호 음식 목록: {disliked_foods}
5. 사용자의 냉장고 로그에서 가장 연관성 높은 음식: "{related_food}"
6. 이 음식이 최근 자주 섭취되었는지 여부: "{recently_eaten}"

음식 분류 단계에 따라 코멘트를 생성하세요:
- 경고 (알레르기 또는 독성)
- 주의 (섭취 제한 음식, 건강에 해로울 가능성 있음)
- 보통 (일반적 섭취 가능)
- 추천 (건강한 음식)
- 권장 (최적의 음식)

응답은 아래 JSON 형식으로 제공하세요:
{format_instructions}
"""
)


def generate_food_comment_from_llm(
    food_name: str,
    preferred_foods: list,
    disliked_foods: list,
    related_food: str,
    recently_eaten: str,
    birth: str,
    diseases: list,
) -> dict:
    """
    LLM을 이용하여 특정 음식에 대한 사용자 맞춤 코멘트를 생성하는 함수
    """
    response = llm.invoke(
        prompt_comment.format(
            food_name=food_name,
            preferred_foods=", ".join(preferred_foods) if preferred_foods else "없음",
            disliked_foods=", ".join(disliked_foods) if disliked_foods else "없음",
            related_food=related_food,
            recently_eaten=recently_eaten,
            birth=birth,
            diseases=", ".join(diseases) if diseases else "없음",
            format_instructions=parser.get_format_instructions(),
        )
    )

    try:
        food_data = parser.parse(response.content)
        category_num, category_name = FOOD_CATEGORY_MAPPING.get(
            food_data.category_name, (3, "보통")
        )

        return {
            "food_name": food_data.food_name,
            "category": category_num,
            "category_name": category_name,
            "comment": food_data.comment,
        }
    except Exception as e:
        print(f"LLM 응답 파싱 오류: {e}")
        return {
            "food_name": food_name,
            "category": 3,
            "category_name": "보통",
            "comment": "이 음식에 대한 추천 정보를 제공할 수 없습니다.",
        }
