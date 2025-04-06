package com.example.seethroughapp.data.model.meal;

import java.util.List;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter @Setter
@ToString
public class Meal {
    private String mealId;
    private String memberId;
    private String servingDate;
    private String servingTime;
    private List<String> menu;
    private String reason;
}
