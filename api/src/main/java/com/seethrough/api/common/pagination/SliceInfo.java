package com.seethrough.api.common.pagination;

import org.springframework.data.domain.Slice;

import lombok.Value;

/**
 * 페이징 결과에 대한 메타데이터를 담는 클래스
 * 현재 페이지 정보와 전체 페이지 정보를 포함합니다.
 */
@Value
public class SliceInfo {
	Integer currentPage;    // 현재 페이지 번호
	Integer pageSize;       // 페이지당 데이터 수
	Boolean hasNext;        // 다음 페이지 존재 여부

	/**
	 * Spring Data JPA의 Slice 객체로부터 SliceInfo 객체 생성
	 * JPA의 페이지 번호는 0부터 시작하지만 사용자 인터페이스에선 1을 더해서 변환
	 */
	public static SliceInfo of(Slice<?> slice) {
		return new SliceInfo(
			slice.getNumber() + 1,
			slice.getNumberOfElements(),
			slice.hasNext()
		);
	}
}
