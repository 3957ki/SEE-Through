package com.seethrough.api.meal.domain;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import com.seethrough.api.member.domain.Member;

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

	@Column(name = "member_id", columnDefinition = "VARCHAR(36)", nullable = false)
	@JdbcTypeCode(SqlTypes.VARCHAR)
	private UUID memberId;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "member_id", insertable = false, updatable = false)
	@ToString.Exclude
	private Member member;

	@Column(name = "serving_date", columnDefinition = "DATE", nullable = false)
	private LocalDate servingDate;

	@Column(name = "serving_time", columnDefinition = "SERVING_TIME", nullable = false)
	@JdbcTypeCode(SqlTypes.NAMED_ENUM)
	private ServingTime servingTime;

	@Builder.Default
	@Column(name = "menu", columnDefinition = "JSON", nullable = false)
	@JdbcTypeCode(SqlTypes.JSON)
	private List<String> menu = new ArrayList<>();

	@Column(name = "reason", columnDefinition = "TEXT")
	private String reason;

	public void update(List<String> menu, String reason) {
		this.menu = menu;
		this.reason = reason;
	}
}
