package ru.presentation.services;

import org.junit.jupiter.api.Test;
import ru.presentation.domain.Presentation;
import ru.presentation.repositories.PresentationRepository;

import java.io.IOException;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class PresentationServiceTest {

    private final PresentationRepository presentationRepository = mock(PresentationRepository.class);
    private final TemplateRenderService templateRenderService = mock(TemplateRenderService.class);
    private final PresentationService presentationService = new PresentationService(
            presentationRepository,
            templateRenderService
    );

    @Test
    void createFromTemplateCreatesSlidesFromRenderedImages() throws IOException {
        byte[] firstSlideImage = new byte[] {1, 2, 3};
        byte[] secondSlideImage = new byte[] {4, 5, 6};
        when(templateRenderService.generateTemplateSlideImages(10L))
                .thenReturn(List.of(firstSlideImage, secondSlideImage));
        when(presentationRepository.findAll())
                .thenReturn(List.of(
                        Presentation.builder().title("Презентация 1").build(),
                        Presentation.builder().title("Презентация 2").build()
                ));
        when(presentationRepository.save(any(Presentation.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Presentation presentation = presentationService.createFromTemplate(10L);

        assertThat(presentation.getTitle()).isEqualTo("Презентация 3");
        assertThat(presentation.getSlides()).hasSize(2);
        assertThat(presentation.getSlides().get(0).getImageBytes()).isEqualTo(firstSlideImage);
        assertThat(presentation.getSlides().get(1).getImageBytes()).isEqualTo(secondSlideImage);
        assertThat(presentation.getSlides())
                .allSatisfy(slide -> assertThat(slide.getPresentation()).isSameAs(presentation));
    }
}
