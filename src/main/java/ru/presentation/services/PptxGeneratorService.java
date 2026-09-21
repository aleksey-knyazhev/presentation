package ru.presentation.services;

import org.apache.poi.sl.usermodel.PictureData;
import org.apache.poi.xslf.usermodel.*;
import org.springframework.stereotype.Service;
import ru.presentation.domain.Slide;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.awt.Color;
import java.awt.Rectangle;

@Service
public class PptxGeneratorService {

    public byte[] generatePresentation(Slide sourceSlide) throws IOException {
        try (XMLSlideShow ppt = new XMLSlideShow();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            XSLFSlide pptSlide = ppt.createSlide();
            addText(pptSlide, sourceSlide.getText());
            addImage(ppt, pptSlide, sourceSlide.getImageBytes());

            ppt.write(out);
            return out.toByteArray();
        }
    }

    private void addText(XSLFSlide pptSlide, String text) {
        if (text == null || text.isBlank()) {
            return;
        }

        XSLFTextBox textBox = pptSlide.createTextBox();
        textBox.setAnchor(new Rectangle(50, 35, 620, 90));

        XSLFTextParagraph paragraph = textBox.addNewTextParagraph();
        XSLFTextRun textRun = paragraph.addNewTextRun();
        textRun.setText(text);
        textRun.setFontSize(28.0);
        textRun.setFontColor(Color.BLUE);
        textRun.setBold(true);
    }

    private void addImage(XMLSlideShow ppt, XSLFSlide pptSlide, byte[] imageBytes) {
        if (imageBytes == null || imageBytes.length == 0) {
            return;
        }

        XSLFPictureData pictureData = ppt.addPicture(imageBytes, PictureData.PictureType.PNG);
        XSLFPictureShape picture = pptSlide.createPicture(pictureData);
        picture.setAnchor(new Rectangle(50, 140, 620, 240));
    }
}
