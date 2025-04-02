package com.example.seethroughapp.model.ingredient;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter @Setter
@ToString
public class Ingredient {
    private String ingredientId;
    private String name;
    private String imagePath;
    private String inboundAt;
    private String expirationAt;
}
