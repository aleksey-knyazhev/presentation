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
import ru.presentation.mappers.SlideMapper;
import ru.presentation.services.PptxGeneratorService;

import java.io.IOException;

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
}
