package ru.presentation.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.presentation.dto.DrawingDto;

import java.io.File;
import java.util.Base64;
import java.util.UUID;

@RestController
@RequestMapping("/api/drawings")
public class DrawingController {

    @PostMapping
    public ResponseEntity<String> saveDrawing(@RequestBody DrawingDto dto) {
        try {
            String base64Image = dto.getImage().split(",")[1]; // Убираем префикс data:image/png;base64,
            byte[] imageBytes = Base64.getDecoder().decode(base64Image);

            String fileName = "drawing_" + UUID.randomUUID() + ".png";
            File outputFile = new File("./uploads/" + fileName);
            outputFile.getParentFile().mkdirs();

            java.nio.file.Files.write(outputFile.toPath(), imageBytes);

            return ResponseEntity.ok("Файл сохранен: " + fileName);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Ошибка: " + e.getMessage());
        }
    }
}
