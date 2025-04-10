package com.seethrough.api.member.infrastructure;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.seethrough.api.member.domain.Member;

public interface MemberJpaRepository extends JpaRepository<Member, UUID> {

	Slice<Member> findAllByDeletedAtIsNull(Pageable pageable);

	Optional<Member> findByMemberIdAndDeletedAtIsNull(UUID memberId);

	List<Member> findMembersByLastLoginAtAfter(LocalDateTime date);

	@Query(
		value = "SELECT MAX(CAST(SUBSTRING(name, 7) AS INTEGER)) " +
			"FROM members " +
			"WHERE name LIKE '신규 사용자%' AND SUBSTRING(name, 7) ~ '^[0-9]+$'",
		nativeQuery = true
	)
	Integer findMaxUserNumber();
}
