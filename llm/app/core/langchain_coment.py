from langchain_openai import ChatOpenAI
from langchain.output_parsers import PydanticOutputParser
from langchain.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from app.core.config import OPENAI_API_KEY

# LangChain LLM 객체 생성 (GPT-4 Turbo 사용)
llm = ChatOpenAI(model="gpt-4-turbo", temperature=0, openai_api_key=OPENAI_API_KEY)

### 코멘트 생성
# JSON 응답을 강제할 스키마 정의
class FoodCommentSchema(BaseModel):
    food_name: str = Field(..., description="현재 섭취하는 음식 이름")
    comment: str = Field(..., description="사용자 맞춤 코멘트")

# LangChain OutputParser 정의 (LLM 응답을 JSON으로 변환)
parser = PydanticOutputParser(pydantic_object=FoodCommentSchema)

# LLM 프롬프트 템플릿 정의 (OpenAI 응답은 comment만 반환)
prompt_comment = ChatPromptTemplate.from_template("""
"{food_name}"을(를) 섭취하려고 합니다. 사용자 로그를 분석하여 다음 내용을 고려한 한 줄 코멘트를 제공하세요:

1. 사용자의 냉장고 로그에서 가장 연관성이 높은 음식: "{related_food}"
2. 이 음식이 최근 자주 섭취되었는지 여부: "{recently_eaten}"
3. 사용자의 건강을 고려한 코멘트 생성

한 줄 코멘트만 반환하세요.
""")

def generate_food_comment_from_llm(food_name: str, related_food: str, recently_eaten: str) -> str:
    """
    LLM을 이용하여 특정 음식에 대한 사용자 맞춤 코멘트를 생성하는 함수
    """
    response = llm.invoke(prompt_comment.format(
        food_name=food_name,
        related_food=related_food,
        recently_eaten=recently_eaten
    ))
    
    try:
        # LLM 응답에서 comment만 추출
        comment = response.content.strip()
        
        # LangChain OutputParser를 사용하여 JSON 변환
        food_data = parser.parse(f'{{"food_name": "{food_name}", "comment": "{comment}"}}')
        return food_data.comment
    except Exception as e:
        print(f"LLM 응답 파싱 오류: {e}")
        return "이 음식에 대한 추천 정보를 제공할 수 없습니다."