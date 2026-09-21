package ru.presentation.controllers;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.presentation.domain.Slide;
import ru.presentation.dto.SlideDto;
import ru.presentation.mappers.SlideMapper;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/drawings")
public class DrawingController {

    private final SlideMapper slideMapper;

    public DrawingController(SlideMapper slideMapper) {
        this.slideMapper = slideMapper;
    }

    @PostMapping
    public ResponseEntity<String> saveDrawing(@RequestBody SlideDto dto) {
        try {
            Slide slide = slideMapper.toSlide(dto);
            Path uploadsDirectory = Path.of("uploads");
            Files.createDirectories(uploadsDirectory);

            String fileName = "drawing_" + UUID.randomUUID() + ".png";
            Files.write(uploadsDirectory.resolve(fileName), slide.getImageBytes());

            log.info("Полученный текст: {}", slide.getText());

            return ResponseEntity.ok("Файл " + fileName + " успешно сохранен на сервере!");
        } catch (Exception e) {
            log.error("Ошибка при сохранении рисунка", e);
            return ResponseEntity.internalServerError().body("Ошибка при сохранении: " + e.getMessage());
        }
    }
}
