package ru.presentation.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.presentation.domain.Template;

public interface TemplateRepository extends JpaRepository<Template, Long> {
}
