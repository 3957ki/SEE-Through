package com.seethrough.api.alert.application.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.seethrough.api.alert.domain.Alert;
import com.seethrough.api.alert.domain.AlertId;
import com.seethrough.api.alert.domain.AlertRepository;
import com.seethrough.api.alert.infrastructure.external.llm.LlmApiAlertService;
import com.seethrough.api.alert.infrastructure.external.llm.dto.response.AlertByIngredientListResponse;
import com.seethrough.api.alert.infrastructure.external.llm.dto.response.AlertByIngredientResponse;
import com.seethrough.api.alert.infrastructure.external.llm.dto.response.AlertByMemberListResponse;
import com.seethrough.api.alert.infrastructure.external.llm.dto.response.AlertByMemberResponse;
import com.seethrough.api.ingredient.domain.Ingredient;
import com.seethrough.api.member.domain.Member;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class AlertService {

	private final AlertRepository alertRepository;
	private final LlmApiAlertService llmApiAlertService;
	private final EntityManager entityManager;

	// TODO: 이거 지금 새로운 트랜잭션으로 적용되도록 수정하기
	@Transactional
	public void createAlertByIngredient(List<Ingredient> ingredients) {
		log.debug("[Service] createAlertByIngredient 호출");

		List<Alert> alerts = createAlertByIngredientLLM(ingredients);

		alertRepository.saveAllWithoutDuplicates(alerts);
	}

	// TODO: 이거 지금 새로운 트랜잭션으로 적용되도록 수정하기
	@Transactional
	public void createAlertByMember(Member member) {
		log.debug("[Service] createAlertByMember 호출: memberId={}", member.getMemberId());

		List<Alert> alerts = createAlertByMemberLLM(member);

		alertRepository.saveAllWithoutDuplicates(alerts);
	}

	public Optional<Alert> getAlert(UUID memberId, UUID ingredientId) {
		log.debug("[Service] getAlert 호출: memberId={}, ingredientId={}", memberId, ingredientId);

		AlertId alertId = AlertId.builder()
			.memberId(memberId)
			.ingredientId(ingredientId)
			.build();

		return alertRepository.findByAlertId(alertId);
	}

	private List<Alert> createAlertByIngredientLLM(List<Ingredient> ingredients) {
		List<Alert> alerts = new ArrayList<>();

		for (Ingredient ingredient : ingredients) {
			AlertByIngredientListResponse listResponse = llmApiAlertService.createAlertByIngredient(ingredient.getName());

			for (AlertByIngredientResponse response : listResponse.getRiskyMembers()) {
				UUID memberId = UUID.fromString(response.getMemberId());

				Member memberRef = entityManager.getReference(Member.class, memberId);

				Alert alert = Alert.builder()
					.alertId(AlertId.builder()
						.memberId(memberId)
						.ingredientId(ingredient.getIngredientId())
						.build())
					.member(memberRef)
					.ingredient(ingredient)
					.comment(response.getComment())
					.build();

				alerts.add(alert);
			}
		}

		return alerts;
	}

	private List<Alert> createAlertByMemberLLM(Member member) {
		List<Alert> alerts = new ArrayList<>();

		AlertByMemberListResponse listResponse = llmApiAlertService.createAlertByMember(member.getMemberId());

		for (AlertByMemberResponse response : listResponse.getRiskIngredients()) {
			UUID ingredientId = UUID.fromString(response.getIngredientId());

			Ingredient ingredientRef = entityManager.getReference(Ingredient.class, ingredientId);

			Alert alert = Alert.builder()
				.alertId(AlertId.builder()
					.memberId(member.getMemberId())
					.ingredientId(ingredientId)
					.build())
				.member(member)
				.ingredient(ingredientRef)
				.comment(response.getComment())
				.build();

			alerts.add(alert);
		}

		return alerts;
	}
}
