package com.example.seethroughapp.model;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter @Setter
@ToString
public class SliceInfo {
    private int currentPage;
    private int totalPages;
    private int pageSize;
}
