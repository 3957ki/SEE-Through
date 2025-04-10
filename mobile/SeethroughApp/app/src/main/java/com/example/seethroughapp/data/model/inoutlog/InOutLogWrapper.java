package com.example.seethroughapp.data.model.inoutlog;

import com.example.seethroughapp.data.model.SliceInfo;

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
