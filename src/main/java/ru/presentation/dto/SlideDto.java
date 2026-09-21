package ru.presentation.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SlideDto {
    private Long id;
    private String image;
    private String text;
    private String textColor;
}
