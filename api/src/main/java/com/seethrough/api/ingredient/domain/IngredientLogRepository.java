package com.seethrough.api.ingredient.domain;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;

public interface IngredientLogRepository {

	Slice<IngredientLog> findIngredientLogs(UUID memberId, Pageable pageable);

	void saveAll(List<IngredientLog> ingredientLogs);

	List<IngredientLog> findAllById(List<UUID> ingredientLogIdList);
}
