package com.seethrough.api.mealplan.infrastructure.converter;

import com.seethrough.api.mealplan.domain.ServingTime;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class ServingTimeConverter implements AttributeConverter<ServingTime, Integer> {
	@Override
	public Integer convertToDatabaseColumn(ServingTime servingTime) {
		if (servingTime == null)
			return null;

		return servingTime.getHour();
	}

	@Override
	public ServingTime convertToEntityAttribute(Integer integer) {
		if (integer == null)
			return null;

		return ServingTime.fromInt(integer)
			.orElse(null);
	}
}