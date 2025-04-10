package com.seethrough.api.ingredient.infrastructure;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.seethrough.api.ingredient.domain.Ingredient;

public interface IngredientJpaRepository extends JpaRepository<Ingredient, UUID> {

	@Query(
		value = "SELECT * FROM (" +
			"SELECT i.*, " +
			"CASE " +
			"    WHEN i.name = ANY(SELECT jsonb_array_elements_text(m.preferred_foods)) THEN 1 " +
			"    WHEN i.name = ANY(SELECT jsonb_array_elements_text(m.disliked_foods)) THEN 3 " +
			"    ELSE 2 " +
			"END AS preference_order " +
			"FROM ingredients i " +
			"LEFT JOIN members m ON m.member_id = CAST(:memberId AS varchar) " +
			") sub_query " +
			"ORDER BY preference_order, ingredient_id",
		countQuery = "SELECT COUNT(*) FROM ingredients",
		nativeQuery = true)
	Slice<Ingredient> findAllByCustomOrder(@Param("memberId") UUID memberId, Pageable pageable);

	Optional<Ingredient> findByIngredientId(UUID ingredientId);
}
