package ru.presentation.repositories;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Sort;
import ru.presentation.domain.Presentation;

import java.util.List;
import java.util.Optional;

public interface PresentationRepository extends JpaRepository<Presentation, Long> {
    @Override
    @EntityGraph(attributePaths = "slides")
    List<Presentation> findAll();

    @Override
    @EntityGraph(attributePaths = "slides")
    List<Presentation> findAll(Sort sort);

    @Override
    @EntityGraph(attributePaths = "slides")
    Optional<Presentation> findById(Long id);
}
