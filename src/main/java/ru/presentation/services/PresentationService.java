package ru.presentation.services;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.presentation.domain.Presentation;
import ru.presentation.repositories.PresentationRepository;

import java.util.List;

@Service
public class PresentationService {

    private final PresentationRepository presentationRepository;

    public PresentationService(PresentationRepository presentationRepository) {
        this.presentationRepository = presentationRepository;
    }

    @Transactional(readOnly = true)
    public List<Presentation> findAll() {
        return presentationRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Presentation findById(Long id) {
        return presentationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Presentation not found: " + id));
    }

    @Transactional
    public Presentation create(Presentation presentation) {
        return presentationRepository.save(presentation);
    }

    @Transactional
    public Presentation update(Long id, Presentation nextPresentation) {
        Presentation presentation = findById(id);
        presentation.setTitle(nextPresentation.getTitle());
        presentation.replaceSlides(nextPresentation.getSlides());
        return presentation;
    }

    @Transactional
    public void delete(Long id) {
        presentationRepository.deleteById(id);
    }
}
