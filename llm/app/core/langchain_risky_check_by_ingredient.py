from langchain_openai import ChatOpenAI
from langchain.output_parsers import PydanticOutputParser, OutputFixingParser
from langchain.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.core.embedding import get_embedding
from app.db.models import DiseaseVector
from app.core.config import OPENAI_API_KEY
import numpy as np
from numpy.linalg import norm
import json
import logging

logger = logging.getLogger(__name__)

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.5, openai_api_key=OPENAI_API_KEY)


class RiskyMemberSchema(BaseModel):
    member_id: str = Field(..., description="위험 가능성이 있는 사용자 ID")
    comment: str = Field(..., description="사용자에게 제공할 경고 메시지")


class RiskyFoodResult(BaseModel):
    ingredient: str = Field(..., description="확인한 음식 재료")
    risky_members: list[RiskyMemberSchema]


parser = PydanticOutputParser(pydantic_object=RiskyFoodResult)
fixing_parser = OutputFixingParser.from_llm(parser=parser, llm=llm)


prompt_risky = ChatPromptTemplate.from_template(
    """
당신은 식품 안전 및 의료 전문가 역할을 수행하는 AI입니다.

"{ingredient}"이라는 재료가 아래 사용자들의 알레르기 정보, 질병 정보, 나이 정보를 기반으로 **섭취 시 위험할 수 있는지** 평가하고,  
**위험한 경우에는 각 사용자별로 의학적 근거에 기반한 경고 메시지**를 작성하세요.

다음 원칙을 반드시 지키세요:

1. 아래 조건 중 하나라도 충족하는 사용자에 대해서만 응답하세요:
   - 해당 재료가 사용자의 **알레르기 목록에 포함**된 경우
   - 해당 재료가 사용자의 **질병으로 인해 섭취 제한이 필요한 경우**
   - 나이가 어린이(만 19세 미만)인 경우 **술, 카페인, 자극적인 음식**에 대해 주의
   - 나이가 고령층(만 65세 이상)인 경우 **딱딱한 음식, 고염분/고지방 음식, 소화 어려운 음식**에 대해 주의

2. comment는 다음 기준을 따릅니다:
   - **단순히 '위험하다'고 말하지 말고**, 해당 재료가 **어떤 방식으로 알레르기 반응, 질병, 연령대별 문제를 유발하는지 구체적으로** 설명하세요.
   - 예: "이 재료는 히스타민 분비를 유발해 아나필락시스를 유도할 수 있습니다."  
          "이 재료는 고염분 식품으로 고혈압 및 고령자에게 부정적 영향을 미칠 수 있습니다."

3. **모든 표현은 다양하고 전문적으로 작성하세요.** 동일한 문장 반복을 절대 피하고, 단순한 말투는 지양하세요.

4. 사용자의 건강 정보에 **명시되지 않은 질병이나 알레르기, 나이 조건**을 근거로 판단하지 마세요.

5. 🔒 반드시 아래 JSON 응답 형식을 **정확하게 따르세요**:
   - `ingredient` 필드는 절대 생략하지 말고, 분석한 재료명을 그대로 명시하세요.
   - `risky_members`는 위험한 사용자만 포함하고, 위험하지 않다면 빈 리스트로 주세요.

---

🧾 확인할 음식 재료:
{ingredient}

👥 사용자별 건강 정보 (JSON):
{health_data}

📚 참고할 수 있는 의료 정보:
{medical_info}

- 각 사용자 객체에는 "is_child"가 true이면 **어린이로 판단**하고, 해당 사용자에 대한 설명은 **친근하고 쉬운 반말로** 작성해주세요.
- 각 사용자 객체에 "is_child": true가 설정된 경우, comment는 **따뜻하고 쉬운 반말로 작성하세요.**
- 그 외 사용자의 comment는 **전문적이고 존댓말로 작성하세요.**
- 반말 예시: "조개는 너가 알레르기가 있는 음식이야. 먹으면 알레르기 반응이 생길 수 있어서 조심해야 해. 가려움증이나 발진이 생길 수 있고, 심하면 호흡이 어려워질 수도 있어. 다음엔 다른 음식을 먹는 게 좋겠어."

📄 응답 형식 (JSON):
{format_instructions}
"""
)


def retrieve_medical_info(
    ingredient: str, diseases: list[str], db: Session, top_k=5
) -> str:
    try:
        embedding = get_embedding(ingredient)

        candidates = (
            db.query(DiseaseVector).filter(DiseaseVector.disease.in_(diseases)).all()
        )

        scored = []
        for item in candidates:
            vec = np.array(item.embedding)
            similarity = np.dot(embedding, vec) / (norm(embedding) * norm(vec))
            scored.append((similarity, item))

        top_related = sorted(scored, key=lambda x: -x[0])[:top_k]
        medical_info = {
            f"📌 '{v.ingredient}'은(는) '{v.disease}' 환자에게 주의가 필요합니다: {v.reason}"
            for _, v in top_related
        }

        return "\n".join(sorted(medical_info)) if medical_info else "없음"
    except Exception as e:
        logger.error(f"❌ 벡터 기반 질병 정보 조회 오류: {e}")
        return "없음"


def analyze_risky_food_for_members(
    ingredient: str, health_data: str, db: Session
) -> list:
    try:
        logger.info("🔍 분석 시작 - ingredient: %s", ingredient)

        # JSON 파싱 및 질병 정보 추출
        parsed_health = json.loads(health_data)

        logger.info("🧾 입력된 사용자 건강 정보: %s", parsed_health)

        diseases = set()
        for member_id, info in parsed_health.items():
            member_diseases = [
                d for d in info.get("diseases", []) if d.lower() != "string"
            ]
            diseases.update(member_diseases)

            logger.info(
                "👤 사용자 ID: %s | 알레르기: %s | 질병: %s",
                member_id,
                info.get("allergies", []),
                member_diseases,
            )

        logger.info("📌 전체 사용자로부터 추출된 질병 목록: %s", list(diseases))

        # 벡터 기반 의료 정보 검색
        medical_info = retrieve_medical_info(ingredient, list(diseases), db)
        logger.info("📚 프롬프트에 포함된 의료 정보:\n%s", medical_info)

        # 프롬프트 구성
        formatted_prompt = prompt_risky.format(
            ingredient=ingredient,
            health_data=health_data,
            medical_info=medical_info,
            format_instructions=parser.get_format_instructions(),
        )
        logger.debug("📤 LLM 최종 프롬프트:\n%s", formatted_prompt)

        # LLM 호출
        response = llm.invoke(formatted_prompt)
        logger.info("📥 LLM 응답 수신 완료 - 응답 길이: %d", len(response.content))
        logger.debug("📥 LLM 응답 내용:\n%s", response.content)

        # 파싱 시도
        parsed = fixing_parser.parse(response.content)

        if not isinstance(parsed.risky_members, list):
            logger.warning(
                "⚠️ 'risky_members'가 리스트가 아님: %s", parsed.risky_members
            )
            return []

        logger.info("✅ 분석 완료 - 위험 사용자 수: %d", len(parsed.risky_members))
        return parsed.risky_members

    except Exception as e:
        logger.error("❌ analyze_risky_food_for_members 오류: %s", e)
        if "response" in locals():
            logger.debug("📥 오류 발생 시 LLM 응답:\n%s", response.content)
        return []
