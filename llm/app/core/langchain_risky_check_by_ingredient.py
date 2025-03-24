from langchain_openai import ChatOpenAI
from langchain.output_parsers import PydanticOutputParser, OutputFixingParser
from langchain.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from app.core.config import OPENAI_API_KEY

# LangChain LLM 객체 생성 (GPT-4 Turbo 사용)
llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0.7, openai_api_key=OPENAI_API_KEY)

# JSON 응답을 강제할 스키마 정의
class RiskyMemberSchema(BaseModel):
    member_id: str = Field(..., description="위험 가능성이 있는 사용자 ID")
    comment: str = Field(..., description="사용자에게 제공할 경고 메시지")

class RiskyFoodResult(BaseModel):
    ingredient: str = Field(..., description="확인한 음식 재료")
    risky_members: list[RiskyMemberSchema]

# LangChain OutputParser 적용 (LLM의 응답을 JSON으로 변환)
parser = PydanticOutputParser(pydantic_object=RiskyFoodResult)
fixing_parser = OutputFixingParser.from_llm(parser=parser, llm=llm)

# LLM 프롬프트 템플릿 정의
prompt_risky = ChatPromptTemplate.from_template("""
"{ingredient}"이라는 재료가 사용자의 알레르기 목록에 포함되는지 확인하고, 위험한 사용자(member_id)에 대한 경고 메시지를 제공합니다.

알레르기 목록을 제공하니, 사용자의 건강을 고려하여 위험할 가능성이 있는 경우만 응답하세요.

확인할 음식 재료:
{ingredient}

사용자별 알레르기 정보:
{allergy_data}

응답 형식:
{format_instructions}
""")

def analyze_risky_food_for_members(ingredient: str, allergy_data: str) -> list:
    """
    LLM을 이용하여 특정 음식이 위험할 가능성이 있는 사용자 정보를 분석하는 함수
    """
    response = llm.invoke(prompt_risky.format(
        ingredient=ingredient,
        allergy_data=allergy_data,
        format_instructions=parser.get_format_instructions()
    ))

    try:
        parsed_data = fixing_parser.parse(response.content)
        return parsed_data.risky_members  # 위험한 사용자 리스트 반환

    except Exception as e:
        print(f"LLM JSON 파싱 오류: {e}")
        return []
