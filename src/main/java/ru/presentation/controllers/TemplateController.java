package ru.presentation.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.presentation.dto.TemplateDto;
import ru.presentation.mappers.TemplateMapper;
import ru.presentation.services.TemplateService;

import java.util.List;

@RestController
@RequestMapping("/api/templates")
public class TemplateController {

    private final TemplateService templateService;
    private final TemplateMapper templateMapper;

    public TemplateController(TemplateService templateService, TemplateMapper templateMapper) {
        this.templateService = templateService;
        this.templateMapper = templateMapper;
    }

    @GetMapping
    public List<TemplateDto> findAll() {
        return templateService.findAll().stream()
                .map(templateMapper::toDto)
                .toList();
    }

    @PostMapping
    public TemplateDto create(@RequestBody TemplateDto dto) {
        return templateMapper.toDto(templateService.create(templateMapper.toTemplate(dto)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        templateService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
