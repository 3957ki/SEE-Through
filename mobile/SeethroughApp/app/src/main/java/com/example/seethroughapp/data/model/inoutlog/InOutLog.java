package com.example.seethroughapp.data.model.inoutlog;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter @Setter
@ToString
public class InOutLog {
    private String ingredientLogId;
    private String ingredientName;
    private String ingredientImagePath;
    private String memberId;
    private String memberName;
    private String memberImagePath;
    private String movementName;
    private String createdAt;
}
