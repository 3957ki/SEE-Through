package com.seethrough.api.member.domain;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "members")
@Getter
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@ToString
public class Member {
	@Id
	@Column(name = "member_id", columnDefinition = "VARCHAR(36)", nullable = false)
	@JdbcTypeCode(SqlTypes.VARCHAR)
	private UUID memberId;

	@Builder.Default
	@Column(name = "name", length = 100, nullable = false)
	private String name = "???";

	@Column(name = "age", nullable = false)
	private Integer age;

	@Column(name = "image_path", length = 255)
	private String imagePath;

	@Builder.Default
	@Column(name = "preferred_foods", columnDefinition = "jsonb", nullable = false)
	@JdbcTypeCode(SqlTypes.JSON)
	private Set<String> preferredFoods = new HashSet<>();

	@Builder.Default
	@Column(name = "disliked_foods", columnDefinition = "jsonb", nullable = false)
	@JdbcTypeCode(SqlTypes.JSON)
	private Set<String> dislikedFoods = new HashSet<>();

	@Builder.Default
	@Column(name = "is_registered", nullable = false)
	private Boolean isRegistered = Boolean.FALSE;

	@Builder.Default
	@Column(name = "recognition_times", nullable = false)
	private Integer recognitionTimes = 0;

	@Builder.Default
	@Column(name = "created_at", nullable = false, updatable = false)
	private LocalDateTime createdAt = LocalDateTime.now();

	@Column(name = "deleted_at")
	private LocalDateTime deletedAt;

	// TODO: 검증 로직

	public void login(int age, String imagePath) {
		if (!isRegistered) {
			this.age = age;
		}

		this.imagePath = imagePath;

		this.recognitionTimes++;
	}

	public void update(String name, int age, Set<String> preferredFoods, Set<String> dislikedFoods) {
		if (!isRegistered) {
			this.isRegistered = true;
		}

		this.name = name;
		this.age = age;
		this.preferredFoods = preferredFoods;
		this.dislikedFoods = dislikedFoods;
	}

	public void delete() {
		validateDeletion();
		this.deletedAt = LocalDateTime.now();
	}

	public void addPreferredFoods(Set<String> preferredFoods) {
		this.preferredFoods.addAll(preferredFoods);
	}

	public void removePreferredFoods(Set<String> preferredFoods) {
		this.preferredFoods.removeAll(preferredFoods);
	}

	public void addDislikedFoods(Set<String> dislikedFoods) {
		this.dislikedFoods.addAll(dislikedFoods);
	}

	public void removeDislikedFoods(Set<String> dislikedFoods) {
		this.dislikedFoods.removeAll(dislikedFoods);
	}

	private void validateDeletion() {
		if (this.deletedAt != null) {
			throw new IllegalStateException("이미 삭제된 회원입니다.");
		}
	}
}
