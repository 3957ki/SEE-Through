package com.seethrough.api.alert.infrastructure;

import java.util.List;

import org.springframework.stereotype.Repository;

import com.seethrough.api.alert.domain.Alert;
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

	@Override
	public void saveAll(List<Alert> alerts) {
		log.debug("[Repository] saveAll 호출: {} 개의 경고", alerts.size());

		alerts.forEach(entityManager::persist);
	}
}
