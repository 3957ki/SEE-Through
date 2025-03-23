package com.seethrough.api.mealplan.domain;

import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import com.seethrough.api.mealplan.infrastructure.converter.ServingTimeConverter;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
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
@Table(name = "meal_plan_schedules")
@Getter
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@ToString
public class MealPlanSchedule {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "meal_plan_schedule_id", columnDefinition = "BIGINT", nullable = false)
	private long mealPlanScheduleId;

	@Column(name = "meal_plan_id", columnDefinition = "VARCHAR(36)", nullable = false)
	@JdbcTypeCode(SqlTypes.VARCHAR)
	private UUID mealPlanId;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "meal_plan_id", insertable = false, updatable = false)
	@ToString.Exclude
	private MealPlan mealPlan;

	@Column(name = "serving_day", columnDefinition = "day_of_week", nullable = false)
	@JdbcTypeCode(SqlTypes.NAMED_ENUM)
	private DayOfWeek servingDay;

	@Column(name = "serving_time", columnDefinition = "INTEGER CHECK (serving_time >= 0 AND serving_time <= 23)", nullable = false)
	@Convert(converter = ServingTimeConverter.class)
	private ServingTime servingTime;
}
