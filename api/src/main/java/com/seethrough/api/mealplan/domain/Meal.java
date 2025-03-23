package com.seethrough.api.mealplan.domain;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "meals")
@Getter
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@ToString
public class Meal {
	@Id
	@Column(name = "meal_id", columnDefinition = "VARCHAR(36)", nullable = false)
	@JdbcTypeCode(SqlTypes.VARCHAR)
	private UUID mealId;

	@Column(name = "meal_plan_id", columnDefinition = "VARCHAR(36)", nullable = false)
	@JdbcTypeCode(SqlTypes.VARCHAR)
	private UUID mealPlanId;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "meal_plan_id", insertable = false, updatable = false)
	@ToString.Exclude
	private MealPlan mealPlan;

	@Column(name = "serving_date", columnDefinition = "DATE", nullable = false)
	private LocalDate servingDate;

	@Column(name = "meal_plan_schedule_id", columnDefinition = "BIGINT", nullable = false)
	private long mealPlanScheduleId;

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "meal_plan_schedule_id", insertable = false, updatable = false)
	@ToString.Exclude
	private MealPlanSchedule mealPlanSchedule;

	@Builder.Default
	@Column(name = "menu", columnDefinition = "JSON", nullable = false)
	@JdbcTypeCode(SqlTypes.JSON)
	private List<String> menu = new ArrayList<>();
}
