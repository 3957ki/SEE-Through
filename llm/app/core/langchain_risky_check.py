import json
from langchain_openai import ChatOpenAI
from langchain.output_parsers import PydanticOutputParser, OutputFixingParser
from langchain.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from app.core.config import OPENAI_API_KEY

### 위험 음식 코멘트 생성
# LangChain LLM 객체 생성 (GPT-4 Turbo 사용)
llm = ChatOpenAI(model="gpt-4-turbo", temperature=0.7, openai_api_key=OPENAI_API_KEY)

# JSON 응답을 강제할 스키마 정의
class RiskyFoodSchema(BaseModel):
    food_name: str = Field(..., description="음식 이름")
    comment: str = Field(..., description="사용자에게 제공할 경고 메시지")


class RiskyFoodList(BaseModel):
    foods: list[RiskyFoodSchema]

# LangChain OutputParser 적용 (LLM의 응답을 JSON으로 강제)
parser = PydanticOutputParser(pydantic_object=RiskyFoodList)

fixing_parser = OutputFixingParser.from_llm(parser=parser, llm=llm)

# LLM 프롬프트 템플릿 정의 (JSON 출력 강제)
prompt_risky = ChatPromptTemplate.from_template("""
다음 음식 목록에서 사용자의 알레르기 목록에 포함된 음식 또는 치명적으로 위험한 음식에 대해서만 경고 메시지를 제공하세요.
예를 들어, 복어, 독버섯 등 즉각적인 위험이 있는 음식이나, 사용자의 알레르기 목록에 있는 음식(예: 땅콩, 갑각류 등)에 대해서만 경고 메시지를 생성해야 합니다.
알레르기 반응이 없는 일반적인 음식이나, 단순한 건강 권장 사항은 포함하지 마세요.
음식 목록:
{food_names}

사용자의 알레르기 목록:
{allergies_name}                                           

각 음식별로 아래 형식의 JSON 리스트로 응답하세요:
{format_instructions}

경고에 해당하는 음식이 여러 개일 경우 반드시 리스트 형식으로 모든 위험한 음식을 포함해야 합니다.
""")

def analyze_risky_foods_with_comments(food_names: list, allergies: list) -> list:
    """
    LLM을 이용하여 음식의 위험성을 분석하고, 필요한 경우 경고 메시지를 제공하는 함수
    """

    food_list_str = "\n".join([f"- {food}" for food in food_names])
    allergy_list_str = "\n".join([f"- {allergy}" for allergy in allergies])

    # DEBUG: format_instructions 확인
    format_instructions = parser.get_format_instructions()
    print("DEBUG: format_instructions ->", format_instructions)

    # LLM 호출 및 JSON 응답 강제
    response = llm.invoke(prompt_risky.format(
        food_names=food_list_str,  # 리스트 형태로 전달하여 명확하게 구분
        allergies_name=allergy_list_str,
        format_instructions=parser.get_format_instructions()
    ))

    # DEBUG: GPT 응답 확인
    print("DEBUG: LLM Response ->", response.content)
    
    try:
        # LLM 응답을 OutputFixingParser로 보정하여 JSON 형식 강제
        parsed_data = fixing_parser.parse(response.content)

        # 'foods' 리스트가 정상적으로 반환되었는지 확인
        if not isinstance(parsed_data.foods, list):
            raise ValueError("Invalid JSON format: 'foods' key is not a list")

        return parsed_data.foods  # 올바른 foods 리스트 반환

    except Exception as e:
        print(f"LLM JSON 파싱 오류: {e}")
        return []