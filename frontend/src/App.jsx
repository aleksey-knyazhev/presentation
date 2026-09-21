import { useEffect, useRef, useState } from 'react';
import { createPresentationPreview, createTemplatePreview } from './api.js';
import DrawingCanvas from './components/DrawingCanvas.jsx';
import PresentationEditorHeader from './components/PresentationEditorHeader.jsx';
import PresentationList from './components/PresentationList.jsx';
import TemplateList from './components/TemplateList.jsx';
import TemplateViewer from './components/TemplateViewer.jsx';
import usePresentations from './hooks/usePresentations.js';
import useTemplates from './hooks/useTemplates.js';

export default function App() {
  const drawingCanvasRef = useRef(null);
  const previewUrlRef = useRef(null);
  const [activeSection, setActiveSection] = useState('presentations');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [templateSlideIndex, setTemplateSlideIndex] = useState(0);
  const {
    activePresentation,
    addPresentation,
    closeEditor,
    deletePresentation,
    openPresentation,
    presentations,
    renameActivePresentation,
    setSlideState,
    slideState,
  } = usePresentations(drawingCanvasRef);
  const {
    addTemplate,
    deleteTemplate,
    templates,
  } = useTemplates();

  useEffect(() => () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }
  }, []);

  const replacePreviewUrl = (url) => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }

    previewUrlRef.current = url;
    setPreviewUrl(url);
  };

  const downloadPresentation = () => {
    drawingCanvasRef.current?.downloadPresentation();
  };

  const showPreview = async () => {
    const slides = drawingCanvasRef.current?.getSlides();
    const currentSlide = slides?.[slideState.activeSlideIndex];

    if (!currentSlide) {
      return;
    }

    setIsPreviewLoading(true);
    try {
      const response = await createPresentationPreview(currentSlide);

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const blob = await response.blob();
      replacePreviewUrl(URL.createObjectURL(blob));
      setPreviewTemplate(null);
    } catch (error) {
      console.error('Ошибка создания превью', error);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const addSlide = () => {
    drawingCanvasRef.current?.addSlide();
  };

  const deleteSlide = () => {
    drawingCanvasRef.current?.deleteSlide();
  };

  const previousSlide = () => {
    drawingCanvasRef.current?.previousSlide();
  };

  const nextSlide = () => {
    drawingCanvasRef.current?.nextSlide();
  };

  const closePresentationEditor = async () => {
    setPreviewTemplate(null);
    setTemplateSlideIndex(0);
    replacePreviewUrl(null);
    await closeEditor();
  };

  const openPresentationEditor = async (presentationId) => {
    setPreviewTemplate(null);
    setTemplateSlideIndex(0);
    replacePreviewUrl(null);
    await openPresentation(presentationId);
  };

  const loadTemplatePreview = async (template, slideIndex) => {
    setIsPreviewLoading(true);
    try {
      const response = await createTemplatePreview(template.id, slideIndex);

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const blob = await response.blob();
      replacePreviewUrl(URL.createObjectURL(blob));
      setPreviewTemplate(template);
      setTemplateSlideIndex(slideIndex);
    } catch (error) {
      console.error('Ошибка открытия шаблона', error);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const openTemplate = (template) => {
    loadTemplatePreview(template, 0);
  };

  const closeTemplateViewer = () => {
    setPreviewTemplate(null);
    setTemplateSlideIndex(0);
    replacePreviewUrl(null);
  };

  const previousTemplateSlide = () => {
    if (!previewTemplate || templateSlideIndex === 0) {
      return;
    }

    loadTemplatePreview(previewTemplate, templateSlideIndex - 1);
  };

  const nextTemplateSlide = () => {
    if (!previewTemplate || templateSlideIndex >= (previewTemplate.slideCount ?? 1) - 1) {
      return;
    }

    loadTemplatePreview(previewTemplate, templateSlideIndex + 1);
  };

  if (!activePresentation) {
    if (previewTemplate) {
      return (
        <TemplateViewer
          template={previewTemplate}
          previewUrl={previewUrl}
          slideIndex={templateSlideIndex}
          isPreviewLoading={isPreviewLoading}
          onClose={closeTemplateViewer}
          onPreviousSlide={previousTemplateSlide}
          onNextSlide={nextTemplateSlide}
        />
      );
    }

    if (activeSection === 'templates') {
      return (
        <TemplateList
          templates={templates}
          onAddTemplate={addTemplate}
          onDeleteTemplate={deleteTemplate}
          onOpenTemplate={openTemplate}
          onOpenPresentations={() => setActiveSection('presentations')}
          onOpenTemplates={() => setActiveSection('templates')}
          isPreviewLoading={isPreviewLoading}
        />
      );
    }

    return (
      <PresentationList
        presentations={presentations}
        onAddPresentation={addPresentation}
        onDeletePresentation={deletePresentation}
        onOpenPresentations={() => setActiveSection('presentations')}
        onOpenPresentation={openPresentationEditor}
        onOpenTemplates={() => setActiveSection('templates')}
      />
    );
  }

  return (
      <main className="app-shell">
        <section className="workspace">
          <PresentationEditorHeader
            presentationTitle={activePresentation.title}
            isPreviewLoading={isPreviewLoading}
            slideState={slideState}
            onAddSlide={addSlide}
            onCloseEditor={closePresentationEditor}
            onDeleteSlide={deleteSlide}
            onDownloadPresentation={downloadPresentation}
            onNextSlide={nextSlide}
            onPreviousSlide={previousSlide}
            onShowPreview={showPreview}
            onRenamePresentation={renameActivePresentation}
          />

          <DrawingCanvas
              key={activePresentation.id}
              ref={drawingCanvasRef}
              initialSlides={activePresentation.slides}
              onSlideStateChange={setSlideState}
          />
          {previewUrl && (
            <section className="preview-panel" aria-label="Превью слайда">
              <img src={previewUrl} alt="Превью слайда" />
            </section>
          )}
        </section>
      </main>
  );
}
