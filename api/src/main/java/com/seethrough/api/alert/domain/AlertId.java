package com.seethrough.api.alert.domain;

import java.io.Serializable;
import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Embeddable
@Getter
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@ToString
public class AlertId implements Serializable {
	@Column(name = "member_id", columnDefinition = "VARCHAR(36)", nullable = false)
	@JdbcTypeCode(SqlTypes.VARCHAR)
	private UUID memberId;

	@Column(name = "ingredient_id", columnDefinition = "VARCHAR(36)", nullable = false)
	@JdbcTypeCode(SqlTypes.VARCHAR)
	private UUID ingredientId;
}
