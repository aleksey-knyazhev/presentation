package ru.presentation.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PreviewRequestDto {
    private Long templateId;
    private Integer slideIndex;
    private String image;
    private String text;
}
