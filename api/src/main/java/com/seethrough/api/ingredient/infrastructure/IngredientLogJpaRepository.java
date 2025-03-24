package com.seethrough.api.ingredient.infrastructure;

import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.seethrough.api.ingredient.domain.IngredientLog;

public interface IngredientLogJpaRepository extends JpaRepository<IngredientLog, UUID> {

	@Query("SELECT i FROM IngredientLog i WHERE (:memberId IS NULL OR i.memberId = :memberId)")
	Slice<IngredientLog> findAllByUserIdOptional(@Param("memberId") UUID memberId, Pageable pageable);
}
