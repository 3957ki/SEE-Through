package com.seethrough.api.mealplan.domain;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "meal_plans")
@Getter
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@ToString
public class MealPlan {
	@Id
	@Column(name = "meal_plan_id", columnDefinition = "VARCHAR(36)", nullable = false)
	@JdbcTypeCode(SqlTypes.VARCHAR)
	private UUID mealPlanId;

	@Column(name = "name", columnDefinition = "TEXT", nullable = false)
	private String name;

	@Column(name = "description", columnDefinition = "TEXT")
	private String description;

	@OneToMany(mappedBy = "mealPlan", cascade = CascadeType.ALL, orphanRemoval = true)
	@ToString.Exclude
	private List<Meal> meals = new ArrayList<>();

	@Builder.Default
	@Column(name = "created_at", columnDefinition = "TIMESTAMP", nullable = false, updatable = false)
	private LocalDateTime createdAt = LocalDateTime.now();
}
