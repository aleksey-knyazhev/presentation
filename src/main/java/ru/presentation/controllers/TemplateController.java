package ru.presentation.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import ru.presentation.dto.PresentationDto;
import ru.presentation.dto.TemplateDto;
import ru.presentation.dto.TemplatePreviewInfoDto;
import ru.presentation.mappers.SlideMapper;
import ru.presentation.mappers.TemplateMapper;
import ru.presentation.services.PresentationService;
import ru.presentation.services.TemplateService;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/templates")
public class TemplateController {

    private final TemplateService templateService;
    private final TemplateMapper templateMapper;
    private final PresentationService presentationService;
    private final SlideMapper slideMapper;

    public TemplateController(
            TemplateService templateService,
            TemplateMapper templateMapper,
            PresentationService presentationService,
            SlideMapper slideMapper
    ) {
        this.templateService = templateService;
        this.templateMapper = templateMapper;
        this.presentationService = presentationService;
        this.slideMapper = slideMapper;
    }

    @GetMapping
    public List<TemplateDto> findAll() {
        return templateService.findAll().stream()
                .map(templateMapper::toDto)
                .toList();
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public TemplateDto create(@RequestPart("file") MultipartFile file) throws IOException {
        return templateMapper.toDto(templateService.createFromFile(file));
    }

    @PutMapping("/{id}")
    public TemplateDto update(@PathVariable Long id, @RequestBody TemplateDto dto) {
        return templateMapper.toDto(templateService.update(id, templateMapper.toTemplate(dto)));
    }

    @GetMapping("/{id}/preview-info")
    public TemplatePreviewInfoDto getPreviewInfo(@PathVariable Long id) throws IOException {
        return new TemplatePreviewInfoDto(templateService.countPreviewPages(id));
    }

    @PostMapping("/{id}/presentations")
    public PresentationDto createPresentation(@PathVariable Long id) throws IOException {
        return slideMapper.toDto(presentationService.createFromTemplate(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        templateService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
