package ru.presentation.mappers;

import org.springframework.stereotype.Component;
import ru.presentation.domain.Slide;
import ru.presentation.dto.SlideDto;

import java.util.Base64;

@Component
public class SlideMapper {

    public Slide toSlide(SlideDto dto) {
        return Slide.builder()
                .imageBytes(decodeImage(dto.getImage()))
                .text(dto.getText())
                .build();
    }

    private byte[] decodeImage(String image) {
        if (image == null || image.isBlank()) {
            return new byte[0];
        }

        int contentStartIndex = image.indexOf(',');
        String base64Image = contentStartIndex >= 0 ? image.substring(contentStartIndex + 1) : image;
        return Base64.getDecoder().decode(base64Image);
    }
}
