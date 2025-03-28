package com.seethrough.api.ingredient.infrastructure;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Repository;

import com.seethrough.api.ingredient.domain.Ingredient;
import com.seethrough.api.ingredient.domain.IngredientRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Repository
@RequiredArgsConstructor
public class IngredientRepositoryImpl implements IngredientRepository {

	@PersistenceContext
	private final EntityManager entityManager;
	private final IngredientJpaRepository ingredientJpaRepository;

	@Override
	public Slice<Ingredient> findIngredients(Pageable pageable) {
		log.debug("[Repository] findIngredients 호출: page={}, size={}, sort={}", pageable.getPageNumber(), pageable.getPageSize(), pageable.getSort());

		Slice<Ingredient> entities = ingredientJpaRepository.findAllBy(pageable);

		log.debug("[Repository] 조회된 식재료 수: {}, 남은 데이터 여부: {}", entities.getNumberOfElements(), entities.hasNext());

		if (!entities.getContent().isEmpty()) {
			log.debug("[Repository] 첫 번째 식재료 상세 정보:{}", entities.getContent().get(0));
		}

		return entities;
	}

	@Override
	public Optional<Ingredient> findByIngredientId(UUID ingredientId) {
		log.debug("[Repository] findByIngredientId 호출");

		Optional<Ingredient> entity = ingredientJpaRepository.findByIngredientId(ingredientId);

		log.debug("[Repository] 조회된 식재료: {}", entity);

		return entity;
	}

	@Override
	public void saveAll(List<Ingredient> ingredients) {
		log.debug("[Repository] saveAll 호출: {} 개의 식재료", ingredients.size());

		ingredientJpaRepository.saveAll(ingredients);
	}

	@Override
	public List<Ingredient> findIngredientsByIngredientId(List<UUID> ingredientIdList) {
		log.debug("[Repository] findIngredientsByIngredientId 호출: {} 개의 식재료", ingredientIdList.size());

		List<Ingredient> entities = ingredientJpaRepository.findAllById(ingredientIdList);

		log.debug("[Repository] 조회된 식재료 수: {}", entities.size());

		if (!entities.isEmpty()) {
			log.debug("[Repository] 첫 번째 식재료 상세 정보:{}", entities.get(0));
		}

		return entities;
	}

	@Override
	public void deleteAll(List<Ingredient> ingredients) {
		log.debug("[Repository] deleteAll 호출: {} 개의 식재료", ingredients.size());

		ingredientJpaRepository.deleteAll(ingredients);
	}
}
