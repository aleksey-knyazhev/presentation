package ru.presentation.mappers;

import org.junit.jupiter.api.Test;
import ru.presentation.domain.Presentation;
import ru.presentation.domain.Slide;
import ru.presentation.dto.PresentationDto;
import ru.presentation.dto.SlideDto;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class SlideMapperTest {

    private final SlideMapper mapper = new SlideMapper();

    @Test
    void toPresentationDoesNotReuseInboundSlideIds() {
        SlideDto slideDto = new SlideDto();
        slideDto.setId(42L);
        slideDto.setText("Slide text");
        slideDto.setTextColor("#000000");

        PresentationDto dto = new PresentationDto();
        dto.setId(7L);
        dto.setTitle("Presentation");
        dto.setSlides(List.of(slideDto));

        Presentation presentation = mapper.toPresentation(dto);

        assertThat(presentation.getId()).isEqualTo(7L);
        assertThat(presentation.getSlides()).hasSize(1);

        Slide slide = presentation.getSlides().getFirst();
        assertThat(slide.getId()).isNull();
        assertThat(slide.getPresentation()).isSameAs(presentation);
        assertThat(slide.getText()).isEqualTo("Slide text");
        assertThat(slide.getTextColor()).isEqualTo("#000000");
    }
}
