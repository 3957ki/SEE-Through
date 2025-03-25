package com.seethrough.api.ingredient.infrastructure;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Repository;

import com.seethrough.api.ingredient.domain.IngredientLog;
import com.seethrough.api.ingredient.domain.IngredientLogRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Repository
@RequiredArgsConstructor
public class IngredientLogRepositoryImpl implements IngredientLogRepository {

	@PersistenceContext
	private final EntityManager entityManager;
	private final IngredientLogJpaRepository ingredientLogJpaRepository;

	@Override
	public Slice<IngredientLog> findIngredientLogs(UUID memberId, Pageable pageable) {
		log.debug("[Repository] findIngredientLogs 호출: memberId={}, page={}, size={}, sort={}",
			memberId, pageable.getPageNumber(), pageable.getPageSize(), pageable.getSort());

		Slice<IngredientLog> entities = ingredientLogJpaRepository.findAllByUserIdOptional(memberId, pageable);

		log.debug("[Repository] 조회된 입출고 로그 수: {}, 남은 데이터 여부: {}", entities.getNumberOfElements(), entities.hasNext());

		if (!entities.getContent().isEmpty()) {
			log.debug("[Repository] 첫 번째 입출고 로그 상세 정보:{}", entities.getContent().get(0));
		}

		return entities;
	}

	@Override
	public void saveAll(List<IngredientLog> ingredientLogs) {
		log.debug("[Repository] saveAll 호출: {} 개의 로그", ingredientLogs.size());

		ingredientLogs.forEach(entityManager::persist);
	}
}
