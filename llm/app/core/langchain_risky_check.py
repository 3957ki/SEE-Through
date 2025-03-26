import json
from langchain_openai import ChatOpenAI
from langchain.output_parsers import PydanticOutputParser, OutputFixingParser
from langchain.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from app.core.config import OPENAI_API_KEY

### 위험 음식 코멘트 생성
# LangChain LLM 객체 생성 (GPT-4 Turbo 사용)
llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0.7, openai_api_key=OPENAI_API_KEY)

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
당신은 의료 및 식품 안전 전문가 역할을 수행하는 AI입니다.

아래의 음식 목록을 분석하여 **사용자의 알레르기 정보 및 질병 정보에 따라 섭취 시 위험할 수 있는 음식**에 대해  
**의학적으로 구체적인 이유와 함께 경고 메시지를 작성하세요.**

💡 반드시 다음 원칙을 지키세요:

1. **사용자의 알레르기 목록에 포함된 음식**은, 알레르기 반응의 구체적인 증상이나 기전(예: 히스타민 분비, 아나필락시스 등)을 언급하며 설명합니다.
2. **사용자의 질병 정보에 따라 주의해야 할 음식**은, 해당 음식이 해당 질병에 어떤 영향을 주는지 구체적으로 서술합니다.
   - 예: 당뇨 → 고당분 음식은 혈당을 급격히 상승시켜 위험
   - 고혈압 → 나트륨 과다로 혈압 상승 위험
   - 신장질환 → 칼륨/인 함량이 높은 음식은 신장 부담 증가
3. **전문적이고 다양하게 표현하며, 절대 단순 문장 반복 금지**
4. 사용자의 입력에 없는 알레르기/질병 정보는 절대 기반으로 삼지 마세요
5. 메시지는 반드시 실제 위험성을 기반으로 하되, 과도하게 불안을 조장하지 않도록 주의하세요.

---

🍽️ 음식 목록:
{food_names}

🧬 사용자의 알레르기 목록:
{allergies_name}

🩺 사용자의 질병 목록:
{disease_name}

---

📄 아래 JSON 스키마 형식으로만 응답하세요:
{format_instructions}

- 음식이 위험하지 않으면 해당 항목은 포함하지 마세요.
- 여러 음식이 위험한 경우, 모두 포함된 리스트 형태로 출력하세요.
""")


def analyze_risky_foods_with_comments(food_names: list, allergies: list, diseases: list) -> list:
    """
    LLM을 이용하여 음식의 위험성을 분석하고, 필요한 경우 경고 메시지를 제공하는 함수
    """

    food_list_str = "\n".join([f"- {food}" for food in food_names])
    allergy_list_str = "\n".join([f"- {allergy}" for allergy in allergies])
    disease_list_str = "\n".join([f"- {disease}" for disease in diseases])

    # LLM 호출 및 JSON 응답 강제
    response = llm.invoke(prompt_risky.format(
        food_names=food_list_str,
        allergies_name=allergy_list_str,
        disease_name=disease_list_str,
        format_instructions=parser.get_format_instructions()
    ))
    
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