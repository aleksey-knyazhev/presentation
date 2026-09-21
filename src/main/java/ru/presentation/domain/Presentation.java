package ru.presentation.domain;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class Presentation {
    private final List<Slide> slides;
}
