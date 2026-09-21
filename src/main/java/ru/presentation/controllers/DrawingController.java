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
            String base64Image = dto.getImage().split(",")[1];
            byte[] imageBytes = java.util.Base64.getDecoder().decode(base64Image);

            String fileName = "drawing_" + java.util.UUID.randomUUID() + ".png";
            java.io.File outputFile = new java.io.File("./uploads/" + fileName);
            outputFile.getParentFile().mkdirs();
            java.nio.file.Files.write(outputFile.toPath(), imageBytes);

            // Здесь можно вывести или записать в БД полученный dto.getText()
            System.out.println("Полученный текст: " + dto.getText());

            return ResponseEntity.ok("Файл " + fileName + " и текст сохранены!");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Ошибка: " + e.getMessage());
        }
    }
}
