package ru.presentation.mappers;

import org.springframework.stereotype.Component;
import ru.presentation.domain.Presentation;
import ru.presentation.domain.Slide;
import ru.presentation.dto.PresentationDto;
import ru.presentation.dto.SlideDto;

import java.util.List;

@Component
public class PresentationMapper {

    private final SlideMapper slideMapper;

    public PresentationMapper(SlideMapper slideMapper) {
        this.slideMapper = slideMapper;
    }

    public Presentation toPresentation(PresentationDto dto) {
        Presentation presentation = Presentation.builder()
                .id(dto == null ? null : dto.getId())
                .title(resolveTitle(dto))
                .build();
        presentation.replaceSlides(toSlides(dto == null ? null : dto.getSlides()));
        return presentation;
    }

    public PresentationDto toDto(Presentation presentation) {
        PresentationDto dto = new PresentationDto();
        dto.setId(presentation.getId());
        dto.setTitle(presentation.getTitle());
        dto.setSlides(presentation.getSlides().stream()
                .map(slideMapper::toDto)
                .toList());
        return dto;
    }

    private List<Slide> toSlides(List<SlideDto> dtos) {
        if (dtos == null || dtos.isEmpty()) {
            return List.of();
        }

        return dtos.stream()
                .map(slideMapper::toSlide)
                .toList();
    }

    private String resolveTitle(PresentationDto dto) {
        if (dto == null || dto.getTitle() == null || dto.getTitle().isBlank()) {
            return "Новая презентация";
        }

        return dto.getTitle();
    }
}
