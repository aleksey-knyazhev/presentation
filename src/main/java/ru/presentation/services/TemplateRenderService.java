package ru.presentation.services;

import org.apache.poi.sl.usermodel.PictureData;
import org.apache.poi.xslf.usermodel.XMLSlideShow;
import org.apache.poi.xslf.usermodel.XSLFPictureData;
import org.apache.poi.xslf.usermodel.XSLFPictureShape;
import org.apache.poi.xslf.usermodel.XSLFShape;
import org.apache.poi.xslf.usermodel.XSLFSlide;
import org.apache.poi.xslf.usermodel.XSLFTextBox;
import org.apache.poi.xslf.usermodel.XSLFTextParagraph;
import org.apache.poi.xslf.usermodel.XSLFTextRun;
import org.springframework.stereotype.Service;
import ru.presentation.domain.Template;
import ru.presentation.repositories.TemplateRepository;

import javax.imageio.ImageIO;
import java.awt.Color;
import java.awt.Dimension;
import java.awt.Graphics2D;
import java.awt.Rectangle;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class TemplateRenderService {

    private static final int PREVIEW_WIDTH = 900;
    private static final int PREVIEW_HEIGHT = 498;

    private final TemplateRepository templateRepository;

    public TemplateRenderService(TemplateRepository templateRepository) {
        this.templateRepository = templateRepository;
    }

    public byte[] generateImagePreviewFromTemplate(Long templateId, int slideIndex, String userText, byte[] userImageBytes) throws IOException {
        byte[] templateBytes = getTemplateBytes(templateId);

        try (XMLSlideShow ppt = new XMLSlideShow(new ByteArrayInputStream(templateBytes))) {
            XSLFSlide slide = getOrCreateSlide(ppt, slideIndex);
            addPreviewText(slide, userText);
            addImage(ppt, slide, userImageBytes);

            return renderSlideToPng(ppt, slide);
        }
    }

    public List<byte[]> generateTemplateSlideImages(Long templateId) throws IOException {
        byte[] templateBytes = getTemplateBytes(templateId);

        try (XMLSlideShow ppt = new XMLSlideShow(new ByteArrayInputStream(templateBytes))) {
            List<byte[]> slideImages = new ArrayList<>();
            for (XSLFSlide slide : ppt.getSlides()) {
                slideImages.add(renderSlideToPng(ppt, slide));
            }
            return slideImages;
        }
    }

    private byte[] getTemplateBytes(Long templateId) {
        Template template = templateRepository.findById(templateId)
                .orElseThrow(() -> new IllegalArgumentException("Шаблон не найден: " + templateId));

        byte[] templateBytes = template.getFileBytes();
        if (templateBytes == null || templateBytes.length == 0) {
            throw new IllegalArgumentException("Файл шаблона пустой: " + templateId);
        }

        return templateBytes;
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

    private void addImage(XMLSlideShow ppt, XSLFSlide pptSlide, byte[] imageBytes) {
        if (imageBytes == null || imageBytes.length == 0) {
            return;
        }

        XSLFPictureData pictureData = ppt.addPicture(imageBytes, PictureData.PictureType.PNG);
        XSLFPictureShape picture = pptSlide.createPicture(pictureData);
        picture.setAnchor(new Rectangle(50, 140, 620, 240));
    }
}
