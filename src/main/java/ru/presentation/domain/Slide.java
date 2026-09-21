package ru.presentation.domain;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class Slide {
    private final byte[] imageBytes;
    private final String text;
}
