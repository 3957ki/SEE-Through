package com.seethrough.api.common.pagination;

import java.util.List;

import org.springframework.data.domain.Slice;

import lombok.Value;

/**
 * 페이징된 데이터와 페이징 정보를 함께 반환하기 위한 DTO 클래스
 *
 * @param <T> 페이징된 데이터의 타입
 */
@Value
public class SliceResponseDto<T> {
	List<T> content;    // 실제 데이터 목록
	SliceInfo sliceInfo;  // 슬라이스 메타데이터

	/**
	 * Spring Data JPA의 Slice 객체를 SliceResponseDto로 변환
	 *
	 * @param slice JPA의 Slice 객체
	 * @return 변환된 SliceResponseDto 객체
	 */
	public static <T> SliceResponseDto<T> of(Slice<T> slice) {
		return new SliceResponseDto<>(
			slice.getContent(),
			SliceInfo.of(slice)
		);
	}
}