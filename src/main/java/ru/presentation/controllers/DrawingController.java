package ru.presentation.controllers;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.presentation.dto.DrawingDto;

@Slf4j
@RestController
@RequestMapping("/api/drawings")
public class DrawingController {

    @PostMapping
    public ResponseEntity<String> saveDrawing(@RequestBody DrawingDto dto) {
        try {
            String rawImage = dto.getImage();
            String base64Image = rawImage.contains(",") ? rawImage.split(",")[1] : rawImage;

            byte[] imageBytes = java.util.Base64.getDecoder().decode(base64Image);

            // Создаем папку, если её нет
            java.io.File outputFile = new java.io.File("./uploads/");
            if (!outputFile.exists()) {
                outputFile.mkdirs();
            }

            // Имя файла (сервис генерации PPTX будет искать именно файлы с префиксом drawing_ и расширением .png)
            String fileName = "drawing_" + java.util.UUID.randomUUID() + ".png";
            java.nio.file.Files.write(new java.io.File(outputFile, fileName).toPath(), imageBytes);

            log.info("Полученный текст: {}", dto.getText());

            return ResponseEntity.ok("Файл " + fileName + " успешно сохранен на сервере!");
        } catch (Exception e) {
            log.error("Ошибка при сохранении рисунка", e);
            return ResponseEntity.internalServerError().body("Ошибка при сохранении: " + e.getMessage());
        }
    }
}
