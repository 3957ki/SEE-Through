package com.seethrough.api.ingredient.domain;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.Type;
import org.hibernate.type.SqlTypes;

import com.seethrough.api.member.domain.Member;

import io.hypersistence.utils.hibernate.type.json.JsonType;
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
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "ingredient_logs")
@Getter
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@ToString
public class IngredientLog {
	@Id
	@Column(name = "ingredient_log_id", columnDefinition = "VARCHAR(36)", nullable = false)
	@JdbcTypeCode(SqlTypes.VARCHAR)
	private UUID ingredientLogId;

	@Column(name = "ingredient_name", columnDefinition = "TEXT", nullable = false)
	private String ingredientName;

	@Column(name = "ingredient_image_path", columnDefinition = "TEXT", nullable = false)
	private String ingredientImagePath;

	@Column(name = "member_id", columnDefinition = "VARCHAR(36)", nullable = false)
	@JdbcTypeCode(SqlTypes.VARCHAR)
	private UUID memberId;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "member_id", insertable = false, updatable = false)
	@ToString.Exclude
	private Member member;

	@Column(name = "movement_type", columnDefinition = "MOVEMENT_TYPE", nullable = false)
	@JdbcTypeCode(SqlTypes.NAMED_ENUM)
	private MovementType movementType;

	@Builder.Default
	@Column(name = "created_at", columnDefinition = "TIMESTAMP", nullable = false, updatable = false)
	private LocalDateTime createdAt = LocalDateTime.now();

	@Setter
	@Column(name = "embedding_vector", columnDefinition = "VECTOR(1536)")
	@Type(JsonType.class)
	private List<Float> embeddingVector;
}
