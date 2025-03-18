# LangChain 기반 위험 판별 및 코멘트 생성 로직 (Batch 처리 + JSON 강제 응답)
from langchain.chat_models import ChatOpenAI
from langchain.output_parsers import PydanticOutputParser
from langchain.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from app.core.config import OPENAI_API_KEY

# LangChain LLM 객체 생성 (GPT-4 Turbo 사용)
llm = ChatOpenAI(model="gpt-4-turbo", temperature=0, openai_api_key=OPENAI_API_KEY)

# JSON 응답을 강제할 스키마 정의
class RiskyFoodSchema(BaseModel):
    food_name: str = Field(..., description="음식 이름")
    is_risky: bool = Field(..., description="해당 음식이 건강에 위험한지 여부")
    risk_reason: str = Field("", description="위험할 경우 그 이유")
    comment: str = Field("", description="사용자에게 제공할 경고 메시지")

class RiskyFoodList(BaseModel):
    foods: list[RiskyFoodSchema]

# LangChain OutputParser 적용 (LLM의 응답을 JSON으로 강제)
parser = PydanticOutputParser(pydantic_object=RiskyFoodList)

# LLM 프롬프트 템플릿 정의 (JSON 출력 강제)
prompt = ChatPromptTemplate.from_template("""
다음 음식 목록의 건강 위험성을 분석하고, 위험한 경우 적절한 경고 메시지를 제공하세요.

음식 목록:
{food_names}

각 음식별로 아래 형식의 JSON 리스트로 응답하세요:
{format_instructions}

경고에 해당하는 음식이 여러 개일 경우 반드시 리스트 형식으로 모든 위험한 음식을 포함해야 합니다.
""")

def analyze_risky_foods_with_comments(food_names: list) -> list:
    """
    LLM을 이용하여 음식의 위험성을 분석하고, 필요한 경우 경고 메시지를 제공하는 함수
    """

    food_list_str = "\n".join([f"- {food}" for food in food_names])
    # LLM 호출 및 JSON 응답 강제
    response = llm.invoke(prompt.format(
        food_names=food_list_str,  # 리스트 형태로 전달하여 명확하게 구분
        format_instructions=parser.get_format_instructions()
    ))
    
    try:
        # LLM 응답을 JSON 스키마에 맞게 변환
        risk_data = parser.parse(response.content)
        return risk_data.foods
    except Exception as e:
        print(f"LLM JSON 파싱 오류: {e}")
        return []
