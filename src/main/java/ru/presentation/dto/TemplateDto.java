package ru.presentation.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TemplateDto {
    private Long id;
    private String title;
    private String description;
    private String fileName;
    private Integer slideCount;
}
