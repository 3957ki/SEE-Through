from langchain_openai import ChatOpenAI
from langchain.output_parsers import PydanticOutputParser
from langchain.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from app.core.config import OPENAI_API_KEY
from typing import List

llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0.6, openai_api_key=OPENAI_API_KEY)

class MealScheduleSchema(BaseModel):
    menu: List[str] = Field(..., description="해당 식사에 포함될 음식 5가지")
    reason: str = Field(..., description="이 식단이 구성된 이유 또는 설명")

class MealPlanSchema(BaseModel):
    schedules: List[MealScheduleSchema] = Field(..., description="각 시간대별 식단")
    required_ingredients: List[str] = Field(..., description="부족한 추가 재료 목록")

parser = PydanticOutputParser(pydantic_object=MealPlanSchema)

prompt_meal_plan = ChatPromptTemplate.from_template("""
음식 선호도와 냉장고 재료를 고려하여 최적의 식단을 생성하세요.

## 기본 원칙
- 사용 가능한 재료 목록 `{available_ingredients}`을 최대한 활용하여 식단을 구성해야 합니다.
- 단, 특정 음식을 만들기 위해 꼭 필요한 재료가 `available_ingredients`에 없으면, `required_ingredients` 리스트에 추가합니다.
                                                    
1. 사용 가능한 재료 목록: {available_ingredients}
2. 사용자의 선호 음식 목록: {preferred_foods}
3. 사용자의 비선호 음식 목록: {disliked_foods}
4. 사용자의 알러지 정보: {allergies}
5. 식단 설명: "{description}"

## 추가 제약 사항
1. `menu`는 각 `meal_id`에 대해 5가지 음식으로 구성해야 합니다.
2. 냉장고에 있는 재료(`available_ingredients`)만으로 만들 수 있는 음식이 우선적으로 포함되어야 합니다.
3. 부족한 재료(`required_ingredients`)는 해당 식단의 음식 조리에 반드시 필요하지만 냉장고에 없는 재료만 포함해야 합니다.
4. 음식명은 명확히 적어야 하며, 한글로 제공해야 합니다.
5. 식단은 각 `serving_time`에 적절한 메뉴를 제공해야 합니다.
6. 알러지가 있는 재료는 사용하지 말아야 합니다.
7. schedules의 길이는 meal_id 개수({meal_count})와 반드시 일치해야 하며, 정확히 {meal_count}개의 식단만 반환해야 합니다.
8. 하루 혹은 연속된 날에 너무 유사한 메뉴가 반복되지 않도록 주의해야 합니다.
9. 식단은 한식, 양식, 경식(가벼운 식사), 퓨전 등 다양한 스타일이 섞이도록 구성되어야 합니다.
10. 반복적인 음식 구성을 피하고, 각 식사는 서로 다른 주재료를 중심으로 구성되어야 합니다.

또한, 각 식단이 추천된 이유를 `reason` 필드에 작성하세요.
[작성 조건]
- 문장은 반드시 “~입니다”, “~했어요”, “~했답니다”, “~하기 좋아요” 등 **자연스럽고 따뜻한 어조**로 끝나야 합니다.
- 모든 문장은 **서로 다른 구조**와 **다양한 표현 방식**을 사용하여, **기계적으로 반복되지 않도록** 작성하세요.
- 사용자가 "이건 나를 위한 식단이야!"라고 느낄 수 있도록 다음 요소 중 **2개 이상**을 반드시 포함하세요:
[포함 요소 중 선택]
1. 사용자의 **선호 음식** 활용 (ex. “좋아하는 김치를 넣었어요”)
2. **비선호/알러지 음식 제외** (ex. “알러지를 피해 재료를 조심스럽게 골랐습니다”)
3. **냉장고 재료를 최대한 활용**한 점 (ex. “남은 채소를 알뜰하게 활용했어요”)
4. **식사 시간대**에 알맞은 메뉴 (ex. “아침엔 속 편한 죽이 좋죠”)
5. **최근 식단과의 차별화** 또는 변화를 준 점 (ex. “늘 먹던 국 대신 오늘은 볶음 요리를 준비했어요”)
6. **계절/날씨/기분을 고려한 구성** (ex. “쌀쌀한 날씨엔 국물 요리가 제격이에요”)
[문체 스타일 가이드]
- 다양한 문장 구조를 써주세요. 예:
  - “오늘은 담백한 재료로 속 편하게 시작할 수 있는 메뉴로 구성했어요.”
  - “선호 음식 위주로 구성해 더 만족스러운 식사가 될 거예요.”
  - “어제와 겹치지 않도록 색다르게 조합해봤답니다.”
  - “비 오는 날엔 바삭한 해물파전이 생각나죠.”
                                        
당신은 JSON만 출력할 수 있는 시스템입니다. 설명이나 예시는 절대 포함하지 마세요.
[주의사항]
- 반드시 {meal_count}개의 식단만 생성해야 합니다. 초과하거나 부족하면 실패입니다.
- 각 식단은 'menu' 5개와 'reason'만 포함하세요.
- 응답은 정확히 아래 스키마와 동일한 JSON이어야 합니다.
- 추가 텍스트, 주석, 예시 없이 오직 JSON만 출력하세요.

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
    meal_count=len(schedules), 
    format_instructions=parser.get_format_instructions()
))

    try:
        return parser.parse(response.content)
    except Exception as e:
        print(f"LLM 응답 파싱 오류: {e}")
        return MealPlanSchema(schedules=[], required_ingredients=[])

