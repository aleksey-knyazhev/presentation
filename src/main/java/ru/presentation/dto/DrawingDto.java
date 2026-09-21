package ru.presentation.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DrawingDto {
    private String image; // Base64 строка
    private String text;  // Текст с описанием или подписью
}
