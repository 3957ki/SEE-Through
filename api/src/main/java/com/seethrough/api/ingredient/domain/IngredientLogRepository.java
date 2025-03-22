package com.seethrough.api.ingredient.domain;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;

public interface IngredientLogRepository {

	Slice<IngredientLog> findIngredientLogs(Pageable pageable);

	void saveAll(List<IngredientLog> ingredientLogs);
}
