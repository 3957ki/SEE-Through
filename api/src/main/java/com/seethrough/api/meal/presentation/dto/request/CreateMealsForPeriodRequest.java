package com.seethrough.api.meal.presentation.dto.request;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.ToString;

@Getter
@ToString
@AllArgsConstructor
public class CreateMealsForPeriodRequest {
	@NotNull(message = "시작 날짜는 필수입니다")
	private LocalDate startDate;

	@NotNull(message = "종료 날짜는 필수입니다")
	private LocalDate endDate;

	@JsonIgnore
	@AssertTrue(message = "종료 날짜는 시작 날짜보다 이후여야 합니다")
	public boolean isDateRangeValid() {
		if (startDate == null || endDate == null) {
			// @NotNull에서 처리됨
			return true;
		}
		return endDate.isEqual(startDate) || endDate.isAfter(startDate);
	}
}
