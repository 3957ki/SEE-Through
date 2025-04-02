package com.example.seethroughapp.model.ingredient;

import com.example.seethroughapp.model.SliceInfo;

import java.util.List;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter @Setter
@ToString
public class IngredientWrapper {
    private List<Ingredient> content;
    private SliceInfo sliceInfo;
}
