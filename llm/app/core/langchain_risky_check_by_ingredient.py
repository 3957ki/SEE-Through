from langchain_openai import ChatOpenAI
from langchain.output_parsers import PydanticOutputParser, OutputFixingParser
from langchain.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from app.core.config import OPENAI_API_KEY

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7, openai_api_key=OPENAI_API_KEY)


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
prompt_risky = ChatPromptTemplate.from_template(
    """
당신은 식품 안전 및 의료 전문가 역할을 수행하는 AI입니다.

"{ingredient}"이라는 재료가 아래 사용자들의 알레르기 정보 및 질병 정보를 기반으로 **섭취 시 위험할 수 있는지** 평가하고,  
**위험한 경우에는 각 사용자별로 의학적 근거에 기반한 경고 메시지**를 작성하세요.

다음 원칙을 반드시 지키세요:

1. 아래 조건 중 하나라도 충족하는 사용자에 대해서만 응답하세요:
   - 해당 재료가 사용자의 **알레르기 목록에 포함**된 경우
   - 해당 재료가 사용자의 **질병으로 인해 섭취 제한이 필요한 경우**

2. comment는 다음 기준을 따릅니다:
   - **단순히 '위험하다'고 말하지 말고**, 해당 재료가 **어떤 방식으로 알레르기 반응 또는 질병에 악영향을 주는지 구체적으로** 설명하세요.
   - 예: "이 재료는 히스타민 분비를 유발해 아나필락시스를 유도할 수 있습니다."  
          "이 재료는 고나트륨 식품으로 고혈압 환자에게 혈압 상승 위험이 있습니다."

3. **모든 표현은 다양하고 전문적으로 작성하세요.** 동일한 문장 반복을 절대 피하고, 단순한 말투는 지양하세요.

4. 사용자의 건강 정보에 **명시되지 않은 질병이나 알레르기**를 근거로 판단하지 마세요.

---

🧾 확인할 음식 재료:
{ingredient}

👥 사용자별 건강 정보 (JSON):
{health_data}

📄 응답 형식 (JSON):
{format_instructions}
"""
)


def analyze_risky_food_for_members(ingredient: str, health_data: str) -> list:
    formatted_prompt = prompt_risky.format(
        ingredient=ingredient,
        health_data=health_data,
        format_instructions=parser.get_format_instructions(),
    )

    # ✅ 프롬프트 출력 (print 또는 logger 사용)
    print("📤 LLM 요청 프롬프트:\n", formatted_prompt)

    response = llm.invoke(formatted_prompt)

    try:
        parsed_data = fixing_parser.parse(response.content)
        return parsed_data.risky_members
    except Exception as e:
        print(f"LLM JSON 파싱 오류: {e}")
        return []
