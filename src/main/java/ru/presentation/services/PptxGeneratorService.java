package ru.presentation.services;

import org.apache.poi.sl.usermodel.PictureData;
import org.apache.poi.xslf.usermodel.*;
import org.springframework.stereotype.Service;
import ru.presentation.domain.Presentation;
import ru.presentation.domain.Slide;
import ru.presentation.domain.Template;
import ru.presentation.repositories.TemplateRepository;

import javax.imageio.ImageIO;
import java.awt.Dimension;
import java.io.ByteArrayOutputStream;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.Rectangle;
import java.awt.image.BufferedImage;
import java.util.List;

@Service
public class PptxGeneratorService {

    private static final int PREVIEW_WIDTH = 900;
    private static final int PREVIEW_HEIGHT = 339;

    private final TemplateRepository templateRepository;

    public PptxGeneratorService(TemplateRepository templateRepository) {
        this.templateRepository = templateRepository;
    }

    public byte[] generatePresentation(Presentation presentation) throws IOException {
        try (XMLSlideShow ppt = new XMLSlideShow();
            ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            List<Slide> presentationSlides = presentation == null ? null : presentation.getSlides();
            List<Slide> slides = presentationSlides == null || presentationSlides.isEmpty()
                    ? List.of(Slide.builder().build())
                    : presentationSlides;

            for (Slide sourceSlide : slides) {
                XSLFSlide pptSlide = ppt.createSlide();
                addText(pptSlide, sourceSlide.getText(), sourceSlide.getTextColor());
                addImage(ppt, pptSlide, sourceSlide.getImageBytes());
            }

            ppt.write(out);
            return out.toByteArray();
        }
    }

    public byte[] generateImagePreviewFromTemplate(Long templateId, String userText, byte[] userImageBytes) throws Exception {
        return generateImagePreviewFromTemplate(templateId, 0, userText, userImageBytes);
    }

    public byte[] generateImagePreviewFromTemplate(Long templateId, int slideIndex, String userText, byte[] userImageBytes) throws Exception {
        Template template = templateRepository.findById(templateId)
                .orElseThrow(() -> new IllegalArgumentException("Шаблон не найден: " + templateId));

        byte[] templateBytes = template.getFileBytes();
        if (templateBytes == null || templateBytes.length == 0) {
            throw new IllegalArgumentException("Файл шаблона пустой: " + templateId);
        }

        try (XMLSlideShow ppt = new XMLSlideShow(new ByteArrayInputStream(templateBytes))) {
            XSLFSlide slide = getOrCreateSlide(ppt, slideIndex);
            addPreviewText(slide, userText);
            addImage(ppt, slide, userImageBytes);

            return renderSlideToPng(ppt, slide);
        }
    }

    public List<byte[]> generateTemplateSlideImages(Long templateId) throws IOException {
        Template template = templateRepository.findById(templateId)
                .orElseThrow(() -> new IllegalArgumentException("Шаблон не найден: " + templateId));

        byte[] templateBytes = template.getFileBytes();
        if (templateBytes == null || templateBytes.length == 0) {
            throw new IllegalArgumentException("Файл шаблона пустой: " + templateId);
        }

        try (XMLSlideShow ppt = new XMLSlideShow(new ByteArrayInputStream(templateBytes))) {
            return ppt.getSlides().stream()
                    .map(slide -> renderSlideToPngUnchecked(ppt, slide))
                    .toList();
        }
    }

    private byte[] renderSlideToPngUnchecked(XMLSlideShow ppt, XSLFSlide slide) {
        try {
            return renderSlideToPng(ppt, slide);
        } catch (IOException e) {
            throw new IllegalStateException("Не удалось создать изображение слайда", e);
        }
    }

    private byte[] renderSlideToPng(XMLSlideShow ppt, XSLFSlide slide) throws IOException {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Dimension pageSize = ppt.getPageSize();
            double scaleX = (double) PREVIEW_WIDTH / pageSize.width;
            double scaleY = (double) PREVIEW_HEIGHT / pageSize.height;
            BufferedImage image = new BufferedImage(PREVIEW_WIDTH, PREVIEW_HEIGHT, BufferedImage.TYPE_INT_ARGB);
            Graphics2D graphics = image.createGraphics();
            try {
                graphics.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
                graphics.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
                graphics.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
                graphics.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
                graphics.scale(scaleX, scaleY);
                slide.draw(graphics);
            } finally {
                graphics.dispose();
            }

            ImageIO.write(image, "png", out);
            return out.toByteArray();
        }
    }

    private XSLFSlide getOrCreateSlide(XMLSlideShow ppt, int slideIndex) {
        List<XSLFSlide> slides = ppt.getSlides();
        if (slideIndex >= 0 && slideIndex < slides.size()) {
            return slides.get(slideIndex);
        }

        if (slides.isEmpty() && slideIndex == 0) {
            return ppt.createSlide();
        }

        throw new IllegalArgumentException("Слайд шаблона не найден: " + slideIndex);
    }

    private void addPreviewText(XSLFSlide slide, String text) {
        if (text == null || text.isBlank()) {
            return;
        }

        XSLFTextBox textBox = findTextBox(slide);
        if (textBox == null) {
            textBox = slide.createTextBox();
            textBox.setAnchor(new Rectangle(50, 35, 620, 90));
        }

        textBox.clearText();
        String[] lines = text.split("\\R", -1);
        for (String line : lines) {
            XSLFTextParagraph paragraph = textBox.addNewTextParagraph();
            XSLFTextRun textRun = paragraph.addNewTextRun();
            textRun.setText(line);
            textRun.setFontSize(28.0);
            textRun.setFontColor(Color.BLACK);
            textRun.setBold(true);
        }
    }

    private XSLFTextBox findTextBox(XSLFSlide slide) {
        for (XSLFShape shape : slide.getShapes()) {
            if (shape instanceof XSLFTextBox textBox) {
                return textBox;
            }
        }

        return null;
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

    private void addImage(XMLSlideShow ppt, XSLFSlide pptSlide, byte[] imageBytes) {
        if (imageBytes == null || imageBytes.length == 0) {
            return;
        }

        XSLFPictureData pictureData = ppt.addPicture(imageBytes, PictureData.PictureType.PNG);
        XSLFPictureShape picture = pptSlide.createPicture(pictureData);
        picture.setAnchor(new Rectangle(50, 140, 620, 240));
    }
}
