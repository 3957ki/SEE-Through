package com.seethrough.api.ingredient.domain;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;

public interface IngredientRepository {

	Slice<Ingredient> findIngredients(Pageable pageable);

	Slice<Ingredient> findIngredientsOrderedByPreference(UUID memberId, Pageable pageable);

	Optional<Ingredient> findByIngredientId(UUID ingredientId);

	void saveAll(List<Ingredient> ingredients);

	List<Ingredient> findIngredientsByIngredientId(List<UUID> ingredientIdList);

	void deleteAll(List<Ingredient> ingredients);
}
