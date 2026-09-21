package ru.presentation.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class PresentationDto {
    private Long id;
    private String title;
    private List<SlideDto> slides;
}
