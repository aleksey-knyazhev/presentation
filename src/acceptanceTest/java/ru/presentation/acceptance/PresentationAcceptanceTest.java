package ru.presentation.acceptance;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import ru.presentation.dto.PresentationDto;
import ru.presentation.dto.SlideDto;

import static org.assertj.core.api.Assertions.assertThat;

class PresentationAcceptanceTest extends AcceptanceTestBase {

    @Test
    void createsReadsUpdatesAndDeletesPresentation() throws Exception {
        PresentationDto createRequest = presentation(
                "Quarter plan",
                slide("data:image/png;base64,AQID", "Intro", "#111827"),
                slide("BAUG", "Details", "#2563eb")
        );

        ApiResponse<PresentationDto> createResponse = post(
                "/api/presentations",
                createRequest,
                PresentationDto.class
        );

        assertThat(createResponse.statusCode()).isEqualTo(HttpStatus.OK.value());
        PresentationDto created = createResponse.body();
        assertThat(created.getId()).isNotNull();
        assertThat(created.getTitle()).isEqualTo("Quarter plan");
        assertThat(created.getSlides()).hasSize(2);
        assertThat(created.getSlides().get(0).getId()).isNotNull();
        assertThat(created.getSlides().get(0).getImage()).isEqualTo("data:image/png;base64,AQID");
        assertThat(created.getSlides().get(0).getText()).isEqualTo("Intro");
        assertThat(created.getSlides().get(0).getTextColor()).isEqualTo("#111827");
        assertThat(created.getSlides().get(1).getImage()).isEqualTo("data:image/png;base64,BAUG");

        ApiResponse<PresentationDto[]> listResponse = get(
                "/api/presentations",
                PresentationDto[].class
        );

        assertThat(listResponse.statusCode()).isEqualTo(HttpStatus.OK.value());
        assertThat(listResponse.body())
                .extracting(PresentationDto::getTitle)
                .containsExactly("Quarter plan");

        ApiResponse<PresentationDto> getResponse = get(
                "/api/presentations/" + created.getId(),
                PresentationDto.class
        );

        assertThat(getResponse.statusCode()).isEqualTo(HttpStatus.OK.value());
        assertThat(getResponse.body().getSlides())
                .extracting(SlideDto::getText)
                .containsExactly("Intro", "Details");

        ApiResponse<PresentationDto> putResponse = put(
                "/api/presentations/" + created.getId(),
                presentation("Updated plan", slide(null, "Only slide", "#16a34a")),
                PresentationDto.class
        );

        assertThat(putResponse.statusCode()).isEqualTo(HttpStatus.OK.value());

        ApiResponse<PresentationDto> updatedResponse = get(
                "/api/presentations/" + created.getId(),
                PresentationDto.class
        );

        assertThat(updatedResponse.statusCode()).isEqualTo(HttpStatus.OK.value());
        PresentationDto updated = updatedResponse.body();
        assertThat(updated.getTitle()).isEqualTo("Updated plan");
        assertThat(updated.getSlides()).hasSize(1);
        assertThat(updated.getSlides().getFirst().getText()).isEqualTo("Only slide");
        assertThat(updated.getSlides().getFirst().getTextColor()).isEqualTo("#16a34a");

        ApiResponse<Void> deleteResponse = delete("/api/presentations/" + created.getId());

        assertThat(deleteResponse.statusCode()).isEqualTo(HttpStatus.NO_CONTENT.value());

        ApiResponse<PresentationDto> deletedResponse = get(
                "/api/presentations/" + created.getId(),
                PresentationDto.class
        );

        assertThat(deletedResponse.statusCode()).isEqualTo(HttpStatus.BAD_REQUEST.value());
    }

    @Test
    void defaultsBlankPresentationTitle() throws Exception {
        PresentationDto request = presentation(" ", slide(null, "Untitled", "#000000"));

        ApiResponse<PresentationDto> response = post(
                "/api/presentations",
                request,
                PresentationDto.class
        );

        assertThat(response.statusCode()).isEqualTo(HttpStatus.OK.value());
        assertThat(response.body().getTitle()).isEqualTo("Новая презентация");
    }

    private static PresentationDto presentation(String title, SlideDto... slides) {
        PresentationDto dto = new PresentationDto();
        dto.setTitle(title);
        dto.setSlides(java.util.List.of(slides));
        return dto;
    }

    private static SlideDto slide(String image, String text, String textColor) {
        SlideDto dto = new SlideDto();
        dto.setImage(image);
        dto.setText(text);
        dto.setTextColor(textColor);
        return dto;
    }
}
