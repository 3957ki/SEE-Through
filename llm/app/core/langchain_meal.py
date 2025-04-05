from langchain_openai import ChatOpenAI
from langchain.output_parsers import PydanticOutputParser
from langchain.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from app.core.config import OPENAI_API_KEY
from typing import List
import logging
import uuid
from typing import List, Tuple
from datetime import datetime
from app.utils.vectors import find_abnormal_menus, save_menu_vectors
import time

logger = logging.getLogger(__name__)

llm = ChatOpenAI(
    model="gpt-4o-mini", temperature=1.2, top_p=0.95, openai_api_key=OPENAI_API_KEY
)


class MealScheduleSchema(BaseModel):
    menu: List[str] = Field(..., description="해당 식사에 포함될 음식 5가지")
    reason: str = Field(..., description="이 식단이 구성된 이유 또는 설명")


class MealPlanSchema(BaseModel):
    schedules: List[MealScheduleSchema] = Field(..., description="각 시간대별 식단")
    required_ingredients: List[str] = Field(..., description="부족한 추가 재료 목록")


parser = PydanticOutputParser(pydantic_object=MealPlanSchema)

prompt_meal_plan = ChatPromptTemplate.from_template(
    """
음식 선호도와 냉장고 재료를 고려하여 최적의 식단을 생성하세요.
같은 사용자가 여러 번 요청할 수 있으므로, **매번 새로운 조합**, **새로운 재료/요리법**을 사용하여 **다채롭게 구성**해야 합니다.

- 요청 식별 코드: {menu_code}
- 이 요청은 여러 요청 중 하나이며, 모든 요청 간에는 음식 이름, 주재료, 조리 방식, 음식 종류, 음식 국적이 **중복되지 않아야 합니다**.
- `{menu_code}`가 다르면 반드시 완전히 다른 식단을 구성해야 합니다.

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

## 제한 사항
- **샐러드 계열 음식은 한 끼당 1개 이하만 포함**될 수 있습니다.
- **모든 음식이 샐러드/주스류로만 구성되는 식단은 피해야 합니다.**

## 추가 제약 사항
- `menu`는 5가지 음식으로 구성해야 합니다.
- 냉장고에 있는 재료(`available_ingredients`)만으로 만들 수 있는 음식이 우선적으로 포함되어야 합니다.
- 부족한 재료(`required_ingredients`)는 해당 식단의 음식 조리에 반드시 필요하지만 냉장고에 없는 재료만 포함해야 합니다.
- 음식명은 명확히 적어야 하며, 한글로 제공해야 합니다.
- `{serving_time}`에 어울리는 음식 포함
- 알러지가 있는 재료는 사용하지 말아야 합니다.
- 질병 정보에 따라 제한이 있는 음식은 피해야 합니다.
- 하루 식단 내에서는 같은 음식 이름이나 유사한 구성(예: 김치볶음밥, 김치찌개 등)이 **절대 반복되지 않도록** 하세요.
- 실제로 존재하지 않는 음식명, 조합이 이상하거나 단어가 섞인 말(예: '치즈볶음찜', '딸기된장찌개')은 생성하지 마세요.

또한, 각 식단이 추천된 이유를 `reason` 필드에 작성하세요.
[작성 조건]
- 문장은 반드시 “~입니다”, “~했어요”, “~했답니다”, “~하기 좋아요” 등 **자연스럽고 따뜻한 어조**로 끝나야 합니다.
- reason의 길이는 **200자 이내**로 작성해주세요.
- 생일인 경우, reason 안에 반드시 “생일”이라는 단어가 포함되어야 합니다.
- 특히 생일일 경우, “생일엔 ~”, “오늘은 특별한 날이니까 ~”, “축하의 의미로 ~”, “달콤한 디저트로 마무리해보세요” 등 **생일을 언급하는 표현**을 포함해주세요.
        
당신은 JSON만 출력할 수 있는 시스템입니다. 설명이나 예시는 절대 포함하지 마세요.
[주의사항]
- 각 식단은 'menu' 5개와 'reason'만 포함하세요.
- 응답은 정확히 아래 스키마와 동일한 JSON이어야 합니다.
- 추가 텍스트, 주석, 예시 없이 오직 JSON만 출력하세요.

{format_instructions}
"""
)

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
    available_ingredients,
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
        else "오늘은 생일이 아닙니다."
    )

    menu_code = str(uuid.uuid4())

    prompt = prompt_meal_plan.format(
        description=description,
        available_ingredients=", ".join(available_ingredients),
        preferred_foods=", ".join(preferred_foods) if preferred_foods else "없음",
        disliked_foods=", ".join(disliked_foods) if disliked_foods else "없음",
        allergies=", ".join(allergies) if allergies else "없음",
        diseases=", ".join(diseases) if diseases else "없음",
        birthday=birthday.strftime("%Y-%m-%d") if birthday else "목목",
        serving_time=serving_time,
        serving_date=serving_date,
        birthday_clause=birthday_clause,
        menu_code=menu_code,
        format_instructions=parser.get_format_instructions(),
    )

    logger.info(
        f"[식단 요청] 날짜: {serving_date}, 시간: {serving_time}, 생일여부: {is_birthday}"
    )
    logger.debug(f"OpenAI 요청 Prompt:\n{prompt}")

    try:
        response = await llm.ainvoke(prompt)
        parsed = parser.parse(response.content)
        meal = parsed.schedules[0]
        required_ingredients = parsed.required_ingredients

        logger.info(f"[응답] meal.menu: {meal.menu}")
        logger.info(f"[응답] meal.reason: {meal.reason}")

        if is_birthday and not any(
            keyword in meal.reason
            for keyword in ["생일", "디저트", "축하", "특별", "케이크"]
        ):
            logger.warning(
                f"🎂 생일({serving_date})인데 식단에 생일 관련 요소가 누락됐습니다!"
            )

        return meal, required_ingredients

    except Exception as e:
        logger.error(f"LLM 응답 파싱 오류: {e}")
        return MealScheduleSchema(menu=[], reason=""), []


async def generate_single_meal_with_rag(
    description,
    schedule,
    preferred_foods,
    disliked_foods,
    allergies,
    diseases,
    birthday,
    available_ingredients,
    db,
    max_retries: int = 3,
) -> Tuple[MealScheduleSchema, List[str]]:
    serving_time = schedule.serving_time
    serving_date = schedule.serving_date

    try:
        serving_mmdd = "-".join(serving_date.split("-")[1:])
        birth_mmdd = birthday.strftime("%m-%d") if birthday else None
        is_birthday = birth_mmdd == serving_mmdd
    except Exception as e:
        logger.error(f"🎂 생일/날짜 비교 오류: {e}")
        is_birthday = False

    birthday_clause = (
        "오늘은 사용자의 생일입니다. 따라서 식단은 생일을 축하하는 특별한 메뉴로 구성되어야 하며, reason에는 반드시 생일 관련 문구가 포함되어야 합니다."
        if is_birthday
        else "오늘은 생일이 아닙니다."
    )

    last_valid_result = None

    for attempt in range(1, max_retries + 1):
        menu_code = str(uuid.uuid4())

        prompt = prompt_meal_plan.format(
            description=description,
            available_ingredients=", ".join(available_ingredients),
            preferred_foods=", ".join(preferred_foods) if preferred_foods else "없음",
            disliked_foods=", ".join(disliked_foods) if disliked_foods else "없음",
            allergies=", ".join(allergies) if allergies else "없음",
            diseases=", ".join(diseases) if diseases else "없음",
            birthday=birthday.strftime("%Y-%m-%d") if birthday else "없음",
            serving_time=serving_time,
            serving_date=serving_date,
            birthday_clause=birthday_clause,
            menu_code=menu_code,
            format_instructions=parser.get_format_instructions(),
        )

        try:
            logger.info(
                f"[RAG 시도 {attempt}/{max_retries}] 날짜: {serving_date}, 시간: {serving_time}"
            )
            start_time = time.perf_counter()

            response = await llm.ainvoke(prompt)

            end_time = time.perf_counter()
            duration = round(end_time - start_time, 2)
            logger.info(f"🕒 RAG 응답 시간: {duration}초")

            parsed = parser.parse(response.content)
            meal = parsed.schedules[0]
            required_ingredients = parsed.required_ingredients

            abnormal_menus = find_abnormal_menus(meal.menu, db)
            if not abnormal_menus:
                save_menu_vectors(meal.menu, db)
                return meal, required_ingredients
            else:
                logger.warning(
                    f"🚫 이상한 음식명 발견 (시도 {attempt}): {abnormal_menus}"
                )
                last_valid_result = (meal, required_ingredients)

        except Exception as e:
            logger.error(f"[RAG] 응답 실패 (시도 {attempt}): {e}")

    if last_valid_result:
        logger.warning("⚠️ 최대 재시도 도달, 마지막 식단 결과를 사용합니다.")
        meal, required_ingredients = last_valid_result
        save_menu_vectors(meal.menu, db)
        return meal, required_ingredients

    return MealScheduleSchema(menu=[], reason="식단 생성 실패"), []
