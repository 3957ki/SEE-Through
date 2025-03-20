package com.seethrough.api.member.domain;

import java.time.LocalDate;
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
	@Column(name = "name", columnDefinition = "TEXT", nullable = false)
	private String name = "???";

	@Builder.Default
	@Column(name = "birth", columnDefinition = "DATE")
	private LocalDate birth = LocalDate.now();

	@Column(name = "age", columnDefinition = "INTEGER", nullable = false)
	private int age;

	@Column(name = "image_path", columnDefinition = "TEXT")
	private String imagePath;

	@Builder.Default
	@Column(name = "preferred_foods", columnDefinition = "JSONB", nullable = false)
	@JdbcTypeCode(SqlTypes.JSON)
	private Set<String> preferredFoods = new HashSet<>();

	@Builder.Default
	@Column(name = "disliked_foods", columnDefinition = "JSONB", nullable = false)
	@JdbcTypeCode(SqlTypes.JSON)
	private Set<String> dislikedFoods = new HashSet<>();

	@Builder.Default
	@Column(name = "allergies", columnDefinition = "JSONB", nullable = false)
	@JdbcTypeCode(SqlTypes.JSON)
	private Set<String> allergies = new HashSet<>();

	@Builder.Default
	@Column(name = "is_registered", columnDefinition = "BOOLEAN", nullable = false)
	private boolean isRegistered = Boolean.FALSE;

	@Builder.Default
	@Column(name = "recognition_times", columnDefinition = "INTEGER", nullable = false)
	private int recognitionTimes = 0;

	@Builder.Default
	@Column(name = "created_at", columnDefinition = "TIMESTAMP", nullable = false, updatable = false)
	private LocalDateTime createdAt = LocalDateTime.now();

	@Column(name = "deleted_at", columnDefinition = "TIMESTAMP")
	private LocalDateTime deletedAt;

	// TODO: 검증 로직

	public void login(int age, String imagePath) {
		if (!isRegistered) {
			this.age = age;
		}

		this.imagePath = imagePath;

		this.recognitionTimes++;
	}

	public void update(String name, LocalDate birth, Set<String> preferredFoods, Set<String> dislikedFoods, Set<String> allergies) {
		if (!isRegistered) {
			this.isRegistered = true;
		}

		this.name = name;
		this.birth = birth;
		calculateAge();
		this.preferredFoods = preferredFoods;
		this.dislikedFoods = dislikedFoods;
		this.allergies = allergies;
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

	public void addAllergies(Set<String> allergies) {
		this.allergies.addAll(allergies);
	}

	public void removeAllergies(Set<String> allergies) {
		this.allergies.removeAll(allergies);
	}

	private void validateDeletion() {
		if (this.deletedAt != null) {
			throw new IllegalStateException("이미 삭제된 회원입니다.");
		}
	}

	private void calculateAge() {
		if (birth == null)
			return;

		LocalDate today = LocalDate.now();

		int age = today.getYear() - birth.getYear();

		if ((today.getMonthValue() < birth.getMonthValue()) ||
			(today.getMonthValue() == birth.getMonthValue() && today.getDayOfMonth() < birth.getDayOfMonth())
		)
			age--;

		this.age = age;
	}
}
