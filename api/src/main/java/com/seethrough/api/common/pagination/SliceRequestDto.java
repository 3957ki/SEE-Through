package com.seethrough.api.common.pagination;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
@AllArgsConstructor
public class SliceRequestDto {
	@Builder.Default
	Integer page = 1;
	@Builder.Default
	Integer size = 10;
	@Builder.Default
	String sortBy = "createdAt";
	@Builder.Default
	String sortDirection = "DESC";

	/**
	 * Spring Data JPA의 Pageable 객체로 변환
	 * JPA의 페이지 번호는 0부터 시작하므로 조정 (page - 1)
	 */
	public Pageable toPageable() {
		Sort.Direction direction = Sort.Direction.fromString(sortDirection);
		return PageRequest.of(page - 1, size, Sort.by(direction, sortBy));
	}

	public Pageable toPageableForNative() {
		Sort.Direction direction = Sort.Direction.fromString(sortDirection);

		String snakeSortBy = camelToSnake(sortBy);
		return PageRequest.of(page - 1, size, Sort.by(direction, snakeSortBy));
	}

	private String camelToSnake(String str) {
		// 빈 문자열이나 null 체크
		if (str == null || str.isEmpty()) {
			return str;
		}

		StringBuilder result = new StringBuilder();
		// 첫 번째 문자는 그대로 추가
		result.append(Character.toLowerCase(str.charAt(0)));

		// 두 번째 문자부터 대문자를 언더스코어와 소문자로 변환
		for (int i = 1; i < str.length(); i++) {
			char ch = str.charAt(i);
			if (Character.isUpperCase(ch)) {
				result.append('_');
				result.append(Character.toLowerCase(ch));
			}
			else {
				result.append(ch);
			}
		}

		return result.toString();
	}
}