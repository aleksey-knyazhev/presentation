package ru.presentation.mappers;

import org.springframework.stereotype.Component;
import ru.presentation.domain.Template;
import ru.presentation.dto.TemplateDto;

@Component
public class TemplateMapper {

    public Template toTemplate(TemplateDto dto) {
        return Template.builder()
                .id(dto.getId())
                .title(resolveTitle(dto))
                .description(dto.getDescription())
                .fileName(dto.getFileName())
                .build();
    }

    public TemplateDto toDto(Template template) {
        TemplateDto dto = new TemplateDto();
        dto.setId(template.getId());
        dto.setTitle(template.getTitle());
        dto.setDescription(template.getDescription());
        dto.setFileName(template.getFileName());
        return dto;
    }

    private String resolveTitle(TemplateDto dto) {
        if (dto == null || dto.getTitle() == null || dto.getTitle().isBlank()) {
            return "Новый шаблон";
        }

        return dto.getTitle();
    }
}
