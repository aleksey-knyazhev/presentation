package ru.presentation.services;

import org.apache.poi.sl.usermodel.PictureData;
import org.apache.poi.xslf.usermodel.*;
import org.springframework.stereotype.Service;
import ru.presentation.domain.Presentation;
import ru.presentation.domain.Slide;

import java.awt.Dimension;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.awt.Color;
import java.awt.Rectangle;
import java.util.List;

@Service
public class PresentationPptxService {

    private static final double SLIDE_IMAGE_HEIGHT_RATIO = 0.8;

    public byte[] generatePresentation(Presentation presentation) throws IOException {
        try (XMLSlideShow ppt = new XMLSlideShow();
            ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            List<Slide> presentationSlides = presentation == null ? null : presentation.getSlides();
            List<Slide> slides = presentationSlides == null || presentationSlides.isEmpty()
                    ? List.of(Slide.builder().build())
                    : presentationSlides;

            for (Slide sourceSlide : slides) {
                XSLFSlide pptSlide = ppt.createSlide();
                addFullSlideImage(ppt, pptSlide, sourceSlide.getImageBytes());
                addText(pptSlide, sourceSlide.getText(), sourceSlide.getTextColor());
            }

            ppt.write(out);
            return out.toByteArray();
        }
    }

    private void addText(XSLFSlide pptSlide, String text, String textColor) {
        if (text == null || text.isBlank()) {
            return;
        }

        XSLFTextBox textBox = pptSlide.createTextBox();
        textBox.setAnchor(new Rectangle(50, 35, 620, 90));

        XSLFTextParagraph paragraph = textBox.addNewTextParagraph();
        XSLFTextRun textRun = paragraph.addNewTextRun();
        textRun.setText(text);
        textRun.setFontSize(28.0);
        textRun.setFontColor(parseColor(textColor));
        textRun.setBold(true);
    }

    private Color parseColor(String color) {
        if (color == null || color.isBlank()) {
            return Color.BLACK;
        }

        try {
            return Color.decode(color);
        } catch (NumberFormatException e) {
            return Color.BLACK;
        }
    }

    private void addFullSlideImage(XMLSlideShow ppt, XSLFSlide pptSlide, byte[] imageBytes) {
        if (imageBytes == null || imageBytes.length == 0) {
            return;
        }

        Dimension pageSize = ppt.getPageSize();
        int imageHeight = (int) Math.round(pageSize.height * SLIDE_IMAGE_HEIGHT_RATIO);
        int imageTop = (pageSize.height - imageHeight) / 2;
        XSLFPictureData pictureData = ppt.addPicture(imageBytes, PictureData.PictureType.PNG);
        XSLFPictureShape picture = pptSlide.createPicture(pictureData);
        picture.setAnchor(new Rectangle(0, imageTop, pageSize.width, imageHeight));
    }
}
