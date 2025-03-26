package com.seethrough.api.member.infrastructure;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Repository;

import com.seethrough.api.member.domain.Member;
import com.seethrough.api.member.domain.MemberRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Repository
@RequiredArgsConstructor
public class MemberRepositoryImpl implements MemberRepository {

	@PersistenceContext
	private final EntityManager entityManager;
	private final MemberJpaRepository memberJpaRepository;

	@Override
	public void save(Member member) {
		log.debug("[Repository] save 호출: {}", member);

		entityManager.persist(member);
	}

	@Override
	public Slice<Member> findMembers(Pageable pageable) {
		log.debug("[Repository] findMembers 호출: page={}, size={}, sort={}", pageable.getPageNumber(), pageable.getPageSize(), pageable.getSort());

		Slice<Member> entities = memberJpaRepository.findAllByDeletedAtIsNull(pageable);

		log.debug("[Repository] 조회된 구성원 수: {}, 남은 데이터 여부: {}", entities.getNumberOfElements(), entities.hasNext());

		if (!entities.getContent().isEmpty()) {
			log.debug("[Repository] 첫 번째 구성원 상세 정보:{}", entities.getContent().get(0));
		}

		return entities;
	}

	@Override
	public Optional<Member> findByMemberId(UUID memberId) {
		log.debug("[Repository] findByMemberId 호출");

		Optional<Member> entity = memberJpaRepository.findByMemberIdAndDeletedAtIsNull(memberId);

		log.debug("[Repository] 조회된 구성원: {}", entity);

		return entity;
	}

	@Override
	public boolean existsByMemberId(UUID memberIdObj) {
		log.debug("[Repository] existsByMemberId 호출");

		boolean result = memberJpaRepository.existsById(memberIdObj);

		log.debug("[Repository] 구성원 존재 여부: {}", result);

		return result;
	}

	@Override
	public List<Member> findMembersByLastLoginAtAfter(LocalDateTime date) {
		log.debug("[Repository] findMembersByLastLoginAtAfter 호출");

		List<Member> result = memberJpaRepository.findMembersByLastLoginAtAfter(date);

		log.debug("[Repository] 구성원 수: {}", result.size());

		return result;
	}
}
