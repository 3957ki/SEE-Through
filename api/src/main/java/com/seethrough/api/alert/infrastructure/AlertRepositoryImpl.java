package com.seethrough.api.alert.infrastructure;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Repository;

import com.seethrough.api.alert.domain.Alert;
import com.seethrough.api.alert.domain.AlertId;
import com.seethrough.api.alert.domain.AlertRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Repository
@RequiredArgsConstructor
public class AlertRepositoryImpl implements AlertRepository {

	@PersistenceContext
	private final EntityManager entityManager;
	private final AlertJpaRepository alertJpaRepository;

	@Override
	public void saveAllWithoutDuplicates(List<Alert> alerts) {
		log.debug("[Repository] saveAll 호출: {} 개의 경고", alerts.size());

		List<AlertId> alertIds = alerts.stream()
			.map(Alert::getAlertId)
			.toList();

		List<Alert> existingAlerts = alertJpaRepository.findAllById(alertIds);
		Set<AlertId> existingAlertIds = existingAlerts.stream()
			.map(Alert::getAlertId)
			.collect(Collectors.toSet());

		List<Alert> saveAlerts = alerts.stream()
			.filter(alert -> !existingAlertIds.contains(alert.getAlertId()))
			.toList();

		log.debug("[Repository] 중복 검사 후 저장할 경고의 수: {}", saveAlerts.size());

		saveAlerts.forEach(entityManager::persist);
	}
}
