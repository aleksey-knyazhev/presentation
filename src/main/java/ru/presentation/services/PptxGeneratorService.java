package ru.presentation.services;

import org.apache.poi.sl.usermodel.ShapeType;
import org.apache.poi.xslf.usermodel.*;
import org.springframework.stereotype.Service;
import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

@Service
public class PptxGeneratorService {

    public byte[] generatePresentation() throws IOException {
        // 1. Создаем объект презентации
        try (XMLSlideShow ppt = new XMLSlideShow();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            // 2. Получаем стандартный пустой макет слайда
            XSLFSlideMaster defaultMaster = ppt.getSlideMasters().get(0);
            XSLFSlideLayout layout = defaultMaster.getLayout(SlideLayout.BLANK);

            // 3. Создаем первый слайд
            XSLFSlide slide1 = ppt.createSlide(layout);

            // 4. Добавляем заголовок (текстовый блок)
            XSLFTextBox textBox = slide1.createTextBox();
            textBox.setAnchor(new java.awt.Rectangle(50, 50, 600, 100)); // Координаты X, Y, ширина, высота

            XSLFTextParagraph paragraph = textBox.addNewTextParagraph();
            XSLFTextRun textRun = paragraph.addNewTextRun();
            textRun.setText("Привет от Spring Boot!");
            textRun.setFontSize(36.0);
            textRun.setFontColor(Color.BLUE);
            textRun.setBold(true);

            // 5. Добавляем простую фигуру (например, прямоугольник)
            XSLFAutoShape rect = slide1.createAutoShape();
            rect.setShapeType(ShapeType.RECT);
            rect.setAnchor(new java.awt.Rectangle(50, 180, 200, 100));
            rect.setFillColor(Color.GREEN);

            // Записываем презентацию в массив байт
            ppt.write(out);
            return out.toByteArray();
        }
    }
}