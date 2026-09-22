package ru.presentation.services;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.presentation.domain.Presentation;
import ru.presentation.domain.Slide;
import ru.presentation.repositories.PresentationRepository;

import java.util.List;
import java.util.Set;

@Service
public class PresentationService {

    private final PresentationRepository presentationRepository;
    private final PptxGeneratorService pptxGeneratorService;

    public PresentationService(PresentationRepository presentationRepository, PptxGeneratorService pptxGeneratorService) {
        this.presentationRepository = presentationRepository;
        this.pptxGeneratorService = pptxGeneratorService;
    }

    @Transactional(readOnly = true)
    public List<Presentation> findAll() {
        return presentationRepository.findAll(Sort.by(Sort.Order.asc("title").ignoreCase()));
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
    public Presentation createFromTemplate(Long templateId) throws java.io.IOException {
        Presentation presentation = Presentation.builder()
                .title(getNextPresentationTitle())
                .build();

        pptxGeneratorService.generateTemplateSlideImages(templateId).stream()
                .map(imageBytes -> Slide.builder()
                        .imageBytes(imageBytes)
                        .text("")
                        .textColor("#1f2937")
                        .build())
                .forEach(presentation::addSlide);

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

    private String getNextPresentationTitle() {
        Set<String> usedTitles = presentationRepository.findAll().stream()
                .map(Presentation::getTitle)
                .collect(java.util.stream.Collectors.toSet());
        int index = usedTitles.size() + 1;

        while (usedTitles.contains("Презентация " + index)) {
            index += 1;
        }

        return "Презентация " + index;
    }
}
