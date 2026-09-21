package ru.presentation.controllers;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.presentation.domain.Presentation;
import ru.presentation.dto.PresentationDto;
import ru.presentation.dto.PreviewRequestDto;
import ru.presentation.mappers.SlideMapper;
import ru.presentation.services.PptxGeneratorService;

import java.io.IOException;
import java.util.Base64;

@RestController
@RequestMapping("/api/presentation")
public class PptxController {

    private final PptxGeneratorService generatorService;
    private final SlideMapper slideMapper;

    public PptxController(PptxGeneratorService generatorService, SlideMapper slideMapper) {
        this.generatorService = generatorService;
        this.slideMapper = slideMapper;
    }

    @GetMapping("/download")
    public ResponseEntity<byte[]> downloadPresentation() {
        return buildPresentationResponse(slideMapper.toPresentation(null));
    }

    @PostMapping("/download")
    public ResponseEntity<byte[]> downloadPresentation(@RequestBody PresentationDto dto) {
        return buildPresentationResponse(slideMapper.toPresentation(dto));
    }

    @PostMapping("/preview")
    public ResponseEntity<byte[]> previewPresentation(@RequestBody PreviewRequestDto dto) {
        try {
            byte[] imageBytes = decodeImage(dto == null ? null : dto.getImage());
            Long templateId = dto == null || dto.getTemplateId() == null ? 1L : dto.getTemplateId();
            int slideIndex = dto == null || dto.getSlideIndex() == null ? 0 : dto.getSlideIndex();
            byte[] previewBytes = generatorService.generateImagePreviewFromTemplate(
                    templateId,
                    slideIndex,
                    dto == null ? null : dto.getText(),
                    imageBytes
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.IMAGE_PNG);
            headers.setCacheControl("no-store");

            return new ResponseEntity<>(previewBytes, headers, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private ResponseEntity<byte[]> buildPresentationResponse(Presentation presentation) {
        try {
            byte[] pptxBytes = generatorService.generatePresentation(presentation);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.presentationml.presentation"));
            headers.setContentDispositionFormData("attachment", "generated_report.pptx");
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

            return new ResponseEntity<>(pptxBytes, headers, HttpStatus.OK);
        } catch (IOException e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
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
