package com.example.seethroughapp.model.inoutlog;

import com.example.seethroughapp.model.SliceInfo;
import com.example.seethroughapp.model.ingredient.Ingredient;

import java.util.List;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter @Setter
@ToString
public class InOutLogWrapper {
    private List<InOutLog> content;
    private SliceInfo sliceInfo;
}
