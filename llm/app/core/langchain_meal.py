from langchain_openai import ChatOpenAI
from langchain.output_parsers import PydanticOutputParser
from langchain.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from app.core.config import OPENAI_API_KEY
from typing import List
import logging

logger = logging.getLogger(__name__)

llm = ChatOpenAI(model="gpt-4-turbo", temperature=0.7, openai_api_key=OPENAI_API_KEY)

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
{birthday_clause}                                            
1. 제공 날짜: {serving_date}
2. 식사 시간대: {serving_time}
3. 사용 가능한 재료 목록: {available_ingredients}
4. 선호 음식 목록: {preferred_foods}
5. 비선호 음식 목록: {disliked_foods}
6. 알러지 정보: {allergies}
7. 질병 정보: {diseases}

## 추가 제약 사항
- `menu`는 5가지 음식으로 구성해야 합니다.
- 냉장고에 있는 재료(`available_ingredients`)만으로 만들 수 있는 음식이 우선적으로 포함되어야 합니다.
- 부족한 재료(`required_ingredients`)는 해당 식단의 음식 조리에 반드시 필요하지만 냉장고에 없는 재료만 포함해야 합니다.
- 음식명은 명확히 적어야 하며, 한글로 제공해야 합니다.
- `{serving_time}`에 어울리는 음식 포함
- 알러지가 있는 재료는 사용하지 말아야 합니다.
- 질병 정보에 따라 제한이 있는 음식은 피해야 합니다.
- 각 식단 간에는 주재료, 조리 방식, 음식 종류(국/찜/볶음/구이/디저트 등), 음식 국적(한식/양식/중식/퓨전 등)에 있어 **중복이 최소화**되도록 구성해주세요.
- 하루 식단 내에서는 같은 음식 이름이나 유사한 구성(예: 김치볶음밥, 김치찌개 등)이 **절대 반복되지 않도록** 하세요.
- 여러 날의 식단이 있다면, **이전 식단과 다른 재료/조리법/맛의 조화**가 느껴지도록 구성해야 합니다.

또한, 각 식단이 추천된 이유를 `reason` 필드에 작성하세요.
[작성 조건]
- 문장은 반드시 “~입니다”, “~했어요”, “~했답니다”, “~하기 좋아요” 등 **자연스럽고 따뜻한 어조**로 끝나야 합니다.
- reason의 길이는 **200자 이내**로 작성해주세요.
- 모든 문장은 서로 다른 구조와 다양한 표현 방식을 사용하여, 기계적으로 반복되지 않도록 작성하세요.
- 생일인 경우, reason 안에 반드시 “생일”이라는 단어가 포함되어야 합니다.
- 특히 생일일 경우, “생일엔 ~”, “오늘은 특별한 날이니까 ~”, “축하의 의미로 ~”, “달콤한 디저트로 마무리해보세요” 등 **생일을 언급하는 표현**을 포함해주세요.
- 사용자가 "이건 나를 위한 식단이야!"라고 느낄 수 있도록 다음 요소 중 2개 이상을 반드시 포함하세요:
[포함 요소 중 선택]
1. 사용자의 **선호 음식** 활용 (ex. “좋아하는 김치를 넣었어요”)
2. **비선호/알러지 음식 제외** (ex. “알러지를 피해 재료를 조심스럽게 골랐습니다”)
3. **냉장고 재료를 최대한 활용**한 점 (ex. “남은 채소를 알뜰하게 활용했어요”)
4. **식사 시간대**에 알맞은 메뉴 (ex. “아침엔 속 편한 죽이 좋죠”)
5. **최근 식단과의 차별화** 또는 변화를 준 점 (ex. “늘 먹던 국 대신 오늘은 볶음 요리를 준비했어요”)
6. **계절/날씨/기분을 고려한 구성** (ex. “쌀쌀한 날씨엔 국물 요리가 제격이에요”)
7. 사용자의 생일을 고려한 특별 메뉴 구성 (ex. “생일엔 달콤한 디저트가 빠질 수 없죠”)
8. 질병 정보를 반영한 식단 (ex. “당뇨를 고려해 당분을 줄인 메뉴로 준비했어요”)
                                        
당신은 JSON만 출력할 수 있는 시스템입니다. 설명이나 예시는 절대 포함하지 마세요.
[주의사항]
- 각 식단은 'menu' 5개와 'reason'만 포함하세요.
- 응답은 정확히 아래 스키마와 동일한 JSON이어야 합니다.
- 추가 텍스트, 주석, 예시 없이 오직 JSON만 출력하세요.

{format_instructions}

""")

import logging

logger = logging.getLogger(__name__)

async def generate_single_meal(
    description,
    schedule,
    preferred_foods,
    disliked_foods,
    allergies,
    diseases,
    birthday,
    available_ingredients
) -> MealScheduleSchema:
    serving_time = schedule.serving_time
    serving_date = schedule.serving_date

    try:
        serving_mmdd = "-".join(serving_date.split("-")[1:])  # "MM-DD"
        birth_mmdd = birthday.strftime("%m-%d") if birthday else None
        is_birthday = birth_mmdd == serving_mmdd
    except Exception as e:
        logger.error(f"🎂 생일/날짜 비교 오류: {e}")
        is_birthday = False
    birthday_clause = (
    "오늘은 사용자의 생일입니다. 따라서 식단은 생일을 축하하는 특별한 메뉴로 구성되어야 하며, reason에는 반드시 생일 관련 문구가 포함되어야 합니다."
    if is_birthday
    else "오늘은 생일이 아닙니다.")   

    prompt = prompt_meal_plan.format(
    description=description,
    available_ingredients=", ".join(available_ingredients),
    preferred_foods=", ".join(preferred_foods) if preferred_foods else "없음",
    disliked_foods=", ".join(disliked_foods) if disliked_foods else "없음",
    allergies=", ".join(allergies) if allergies else "없음",
    diseases=", ".join(diseases) if diseases else "없음",
    birthday=birthday.strftime("%Y-%m-%d") if birthday else "모름",
    serving_time=serving_time,
    serving_date=serving_date,
    birthday_clause=birthday_clause,  # 새로 추가
    format_instructions=parser.get_format_instructions()
)

    
    logger.info(f"[식단 요청] 날짜: {serving_date}, 시간: {serving_time}, 생일여부: {is_birthday}")
    logger.debug(f"OpenAI 요청 Prompt:\n{prompt}")

    try:
        response = await llm.ainvoke(prompt)
        parsed = parser.parse(response.content)
        meal = parsed.schedules[0]
        required_ingredients = parsed.required_ingredients

        logger.info(f"[응답] meal.menu: {meal.menu}")
        logger.info(f"[응답] meal.reason: {meal.reason}")

        if is_birthday and not any(keyword in meal.reason for keyword in ["생일", "디저트", "축하", "특별", "케이크"]):
            logger.warning(f"🎂 생일({serving_date})인데 식단에 생일 관련 요소가 누락됐습니다!")

        return meal, required_ingredients

    except Exception as e:
        logger.error(f"LLM 응답 파싱 오류: {e}")
        return MealScheduleSchema(menu=[], reason=""), []


