package com.seethrough.api.alert.application.service;

import java.util.ArrayList;
import java.util.List;
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

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class AlertService {

	private final AlertRepository alertRepository;
	private final LlmApiAlertService llmApiAlertService;

	@Transactional
	public void createAlertByIngredient(List<Ingredient> ingredients) {
		log.debug("[Service] createAlertByIngredient 호출");

		List<Alert> alerts = createAlertByIngredientLLM(ingredients);

		alertRepository.saveAllWithoutDuplicates(alerts);
	}

	@Transactional
	public void createAlertByMember(UUID memberId) {
		log.debug("[Service] createAlertByMember 호출");

		List<Alert> alerts = createAlertByMemberLLM(memberId);

		alertRepository.saveAllWithoutDuplicates(alerts);
	}

	private List<Alert> createAlertByIngredientLLM(List<Ingredient> ingredients) {
		List<Alert> alerts = new ArrayList<>();

		for (Ingredient ingredient : ingredients) {
			AlertByIngredientListResponse listResponse = llmApiAlertService.createAlertByIngredient(ingredient.getName());

			for (AlertByIngredientResponse response : listResponse.getRiskyMembers()) {
				Alert alert = Alert.builder()
					.alertId(AlertId.builder()
						.memberId(UUID.fromString(response.getMemberId()))
						.ingredientId(ingredient.getIngredientId())
						.build())
					.comment(response.getComment())
					.build();

				alerts.add(alert);
			}
		}

		return alerts;
	}

	private List<Alert> createAlertByMemberLLM(UUID memberId) {
		List<Alert> alerts = new ArrayList<>();

		AlertByMemberListResponse listResponse = llmApiAlertService.createAlertByMember(memberId);

		for (AlertByMemberResponse response : listResponse.getRiskIngredients()) {
			Alert alert = Alert.builder()
				.alertId(AlertId.builder()
					.memberId(memberId)
					.ingredientId(UUID.fromString(response.getIngredientId()))
					.build())
				.comment(response.getComment())
				.build();

			alerts.add(alert);
		}

		return alerts;
	}
}
