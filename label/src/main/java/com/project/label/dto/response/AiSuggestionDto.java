package com.project.label.dto.response;
import lombok.Data;

@Data
public class AiSuggestionDto {
    private String labelName;
    private double xcenter;
    private double ycenter;
    private double width;
    private double height;
    private double confidence;
}