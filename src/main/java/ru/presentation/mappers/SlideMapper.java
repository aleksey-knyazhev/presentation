package ru.presentation.mappers;

import org.springframework.stereotype.Component;
import ru.presentation.domain.Presentation;
import ru.presentation.domain.Slide;
import ru.presentation.dto.PresentationDto;
import ru.presentation.dto.SlideDto;

import java.util.Base64;
import java.util.List;

@Component
public class SlideMapper {

    public Slide toSlide(SlideDto dto) {
        return Slide.builder()
                .imageBytes(decodeImage(dto.getImage()))
                .text(dto.getText())
                .textColor(dto.getTextColor())
                .build();
    }

    public List<Slide> toSlides(List<SlideDto> dtos) {
        if (dtos == null || dtos.isEmpty()) {
            return List.of();
        }

        return dtos.stream()
                .map(this::toSlide)
                .toList();
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
                .map(this::toDto)
                .toList());
        return dto;
    }

    private SlideDto toDto(Slide slide) {
        SlideDto dto = new SlideDto();
        dto.setId(slide.getId());
        dto.setImage(encodeImage(slide.getImageBytes()));
        dto.setText(slide.getText());
        dto.setTextColor(slide.getTextColor());
        return dto;
    }

    private byte[] decodeImage(String image) {
        if (image == null || image.isBlank()) {
            return new byte[0];
        }

        int contentStartIndex = image.indexOf(',');
        String base64Image = contentStartIndex >= 0 ? image.substring(contentStartIndex + 1) : image;
        return Base64.getDecoder().decode(base64Image);
    }

    private String encodeImage(byte[] imageBytes) {
        if (imageBytes == null || imageBytes.length == 0) {
            return null;
        }

        return "data:image/png;base64," + Base64.getEncoder().encodeToString(imageBytes);
    }

    private String resolveTitle(PresentationDto dto) {
        if (dto == null || dto.getTitle() == null || dto.getTitle().isBlank()) {
            return "Новая презентация";
        }

        return dto.getTitle();
    }
}
