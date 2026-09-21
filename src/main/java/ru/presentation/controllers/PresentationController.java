package ru.presentation.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.presentation.dto.PresentationDto;
import ru.presentation.mappers.SlideMapper;
import ru.presentation.services.PresentationService;

import java.util.List;

@RestController
@RequestMapping("/api/presentations")
public class PresentationController {

    private final PresentationService presentationService;
    private final SlideMapper slideMapper;

    public PresentationController(PresentationService presentationService, SlideMapper slideMapper) {
        this.presentationService = presentationService;
        this.slideMapper = slideMapper;
    }

    @GetMapping
    public List<PresentationDto> findAll() {
        return presentationService.findAll().stream()
                .map(slideMapper::toDto)
                .toList();
    }

    @GetMapping("/{id}")
    public PresentationDto findById(@PathVariable Long id) {
        return slideMapper.toDto(presentationService.findById(id));
    }

    @PostMapping
    public PresentationDto create(@RequestBody PresentationDto dto) {
        return slideMapper.toDto(presentationService.create(slideMapper.toPresentation(dto)));
    }

    @PutMapping("/{id}")
    public PresentationDto update(@PathVariable Long id, @RequestBody PresentationDto dto) {
        return slideMapper.toDto(presentationService.update(id, slideMapper.toPresentation(dto)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        presentationService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
