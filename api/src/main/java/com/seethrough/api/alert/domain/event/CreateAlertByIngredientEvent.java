package com.seethrough.api.alert.domain.event;

import java.util.List;

import com.seethrough.api.ingredient.domain.Ingredient;

import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

@Getter
@Builder
@ToString
public class CreateAlertByIngredientEvent {
	private final List<Ingredient> ingredients;
}
