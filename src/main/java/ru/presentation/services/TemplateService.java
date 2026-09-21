package ru.presentation.services;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.presentation.domain.Template;
import ru.presentation.repositories.TemplateRepository;

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
    public void delete(Long id) {
        templateRepository.deleteById(id);
    }
}
