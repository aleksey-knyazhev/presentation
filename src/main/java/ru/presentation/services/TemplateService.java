package ru.presentation.services;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import ru.presentation.domain.Template;
import ru.presentation.repositories.TemplateRepository;

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
        return templateRepository.findAll();
    }

    @Transactional
    public Template create(Template template) {
        return templateRepository.save(template);
    }

    @Transactional
    public Template createFromFile(MultipartFile file) throws IOException {
        String fileName = file.getOriginalFilename();
        if (fileName == null || !fileName.toLowerCase().endsWith(".potx")) {
            throw new IllegalArgumentException("Разрешены только файлы .potx");
        }

        Template template = Template.builder()
                .title(fileName.replaceFirst("(?i)\\.potx$", ""))
                .fileName(fileName)
                .fileBytes(file.getBytes())
                .build();
        return templateRepository.save(template);
    }

    @Transactional
    public void delete(Long id) {
        templateRepository.deleteById(id);
    }
}
