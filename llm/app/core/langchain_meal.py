from langchain_openai import ChatOpenAI
from langchain.output_parsers import PydanticOutputParser
from langchain.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from app.core.config import OPENAI_API_KEY
from typing import List

llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0, openai_api_key=OPENAI_API_KEY)

class MealScheduleSchema(BaseModel):
    menu: List[str] = Field(..., description="해당 식사에 포함될 음식 5가지")

class MealPlanSchema(BaseModel):
    schedules: List[MealScheduleSchema] = Field(..., description="각 시간대별 식단")
    required_ingredients: List[str] = Field(..., description="부족한 추가 재료 목록")

parser = PydanticOutputParser(pydantic_object=MealPlanSchema)

prompt_meal_plan = ChatPromptTemplate.from_template("""
참여자들의 음식 선호도와 냉장고 재료를 고려하여 최적의 식단을 생성하세요.

## 기본 원칙
- 사용 가능한 재료 목록 `{available_ingredients}`을 최대한 활용하여 식단을 구성해야 합니다.
- 단, 특정 음식을 만들기 위해 꼭 필요한 재료가 `available_ingredients`에 없으면, `required_ingredients` 리스트에 추가합니다.
                                                    
1. 사용 가능한 재료 목록: {available_ingredients}
2. 참여자들의 선호 음식 목록: {preferred_foods}
3. 참여자들의 비선호 음식 목록: {disliked_foods}
4. 참여자들의 알러지 정보: {allergies}
5. 식단 설명: "{description}"

## 추가 제약 사항
1. `menu`는 각 `meal_id`에 대해 5가지 음식으로 구성해야 합니다.
2. 냉장고에 있는 재료(`available_ingredients`)만으로 만들 수 있는 음식이 우선적으로 포함되어야 합니다.
3. 부족한 재료(`required_ingredients`)는 해당 식단의 음식 조리에 반드시 필요하지만 냉장고에 없는 재료만 포함해야 합니다.
4. 음식명은 명확히 적어야 하며, 한글로 제공해야 합니다.
5. 식단은 각 `serving_time`에 적절한 메뉴를 제공해야 합니다.
   - **아침(6~10시):** 가벼운 식사 (죽, 샐러드, 계란, 빵 등)
   - **점심(11~15시):** 일반적인 한식 또는 양식 (밥, 국, 반찬 등)
   - **저녁(16~21시):** 가벼우면서도 포만감 있는 식사 (구이, 찜 요리 등)
6. **알러지가 있는 재료는 사용하지 말아야 합니다.**                                                  

응답 형식:
{format_instructions}
""")

def generate_meal_plan_from_llm(description, schedules, preferred_foods, disliked_foods, allergies, available_ingredients):
    """
    LLM을 이용하여 최적의 식단을 생성하는 함수
    """
    response = llm.invoke(prompt_meal_plan.format(
        description=description,
        available_ingredients=", ".join(available_ingredients),
        preferred_foods=", ".join(preferred_foods) if preferred_foods else "없음",
        disliked_foods=", ".join(disliked_foods) if disliked_foods else "없음",
        allergies=", ".join(allergies) if allergies else "없음",
        format_instructions=parser.get_format_instructions()
    ))

    try:
        return parser.parse(response.content)
    except Exception as e:
        print(f"LLM 응답 파싱 오류: {e}")
        return MealPlanSchema(schedules=[], required_ingredients=[])
