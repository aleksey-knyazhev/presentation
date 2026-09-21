package ru.presentation.services;

import org.apache.poi.xslf.usermodel.XMLSlideShow;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import ru.presentation.domain.Template;
import ru.presentation.repositories.TemplateRepository;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.List;

@Service
public class TemplateService {

    private final TemplateRepository templateRepository;

    public TemplateService(TemplateRepository templateRepository) {
        this.templateRepository = templateRepository;
    }

    @Transactional(readOnly = true)
    public List<Template> findAll() {
        return templateRepository.findAll(Sort.by(Sort.Order.asc("title").ignoreCase()));
    }

    @Transactional(readOnly = true)
    public int countPreviewPages(Long id) throws IOException {
        Template template = templateRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Шаблон не найден: " + id));

        byte[] fileBytes = template.getFileBytes();
        if (fileBytes == null || fileBytes.length == 0) {
            return 0;
        }

        try (XMLSlideShow slideShow = new XMLSlideShow(new ByteArrayInputStream(fileBytes))) {
            return slideShow.getSlides().size();
        }
    }

    @Transactional
    public Template create(Template template) {
        return templateRepository.save(template);
    }

    @Transactional
    public Template update(Long id, Template updatedTemplate) {
        Template template = templateRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Шаблон не найден: " + id));

        template.setTitle(resolveTitle(updatedTemplate.getTitle()));
        return templateRepository.save(template);
    }

    @Transactional
    public Template createFromFile(MultipartFile file) throws IOException {
        String fileName = file.getOriginalFilename();
        if (fileName == null || !fileName.toLowerCase().endsWith(".potx")) {
            throw new IllegalArgumentException("Разрешены только файлы .potx");
        }

        byte[] fileBytes = file.getBytes();
        Template template = Template.builder()
                .title(fileName.replaceFirst("(?i)\\.potx$", ""))
                .fileName(fileName)
                .slideCount(countSlides(fileBytes))
                .fileBytes(fileBytes)
                .build();
        return templateRepository.save(template);
    }

    private int countSlides(byte[] fileBytes) throws IOException {
        try (XMLSlideShow slideShow = new XMLSlideShow(new ByteArrayInputStream(fileBytes))) {
            return slideShow.getSlides().size();
        }
    }

    @Transactional
    public void delete(Long id) {
        templateRepository.deleteById(id);
    }

    private String resolveTitle(String title) {
        if (title == null || title.isBlank()) {
            return "Новый шаблон";
        }

        return title;
    }
}
