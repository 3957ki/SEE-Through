package com.seethrough.api.ingredient.domain;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.Type;
import org.hibernate.type.SqlTypes;

import com.seethrough.api.alert.domain.Alert;
import com.seethrough.api.member.domain.Member;

import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "ingredients")
@Getter
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@ToString
public class Ingredient {
	@Id
	@Column(name = "ingredient_id", columnDefinition = "VARCHAR(36)", nullable = false)
	@JdbcTypeCode(SqlTypes.VARCHAR)
	private UUID ingredientId;

	@Column(name = "name", columnDefinition = "TEXT", nullable = false)
	private String name;

	@Column(name = "image_path", columnDefinition = "TEXT", nullable = false)
	private String imagePath;

	@Column(name = "member_id", columnDefinition = "VARCHAR(36)", nullable = false)
	@JdbcTypeCode(SqlTypes.VARCHAR)
	private UUID memberId;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "member_id", insertable = false, updatable = false)
	@ToString.Exclude
	private Member member;

	@Builder.Default
	@Column(name = "inbound_at", columnDefinition = "TIMESTAMP", nullable = false, updatable = false)
	private LocalDateTime inboundAt = LocalDateTime.now();

	@Column(name = "expiration_at", columnDefinition = "TIMESTAMP")
	private LocalDateTime expirationAt;

	@Setter
	@Column(name = "embedding_vector", columnDefinition = "VECTOR(1536)")
	@Type(JsonType.class)
	@ToString.Exclude
	private List<Float> embeddingVector;

	@OneToMany(mappedBy = "ingredient", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
	private List<Alert> alerts = new ArrayList<>();
}
