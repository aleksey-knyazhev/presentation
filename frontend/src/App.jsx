import { useEffect, useRef, useState } from 'react';
import {
  createTemplatePreview,
  getTemplatePreviewInfo,
} from './api.js';
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
  const [templatePageCount, setTemplatePageCount] = useState(0);
  const {
    activePresentation,
    addPresentation,
    addPresentationFromTemplate,
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
    renameTemplate,
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
    setActiveSection('presentations');
    setTemplateSlideIndex(0);
    setTemplatePageCount(0);
    replacePreviewUrl(null);
    await closeEditor();
  };

  const openPresentationEditor = async (presentationId) => {
    setPreviewTemplate(null);
    setTemplateSlideIndex(0);
    setTemplatePageCount(0);
    replacePreviewUrl(null);
    await openPresentation(presentationId);
  };

  const createAndOpenPresentation = async () => {
    const savedPresentation = await addPresentation();
    if (!savedPresentation) {
      return;
    }

    await openPresentationEditor(savedPresentation.id);
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
    setIsPreviewLoading(true);
    getTemplatePreviewInfo(template.id)
      .then((info) => {
        setTemplatePageCount(info.pageCount || template.slideCount || 1);
        return loadTemplatePreview(template, 0);
      })
      .catch((error) => {
        console.error('Ошибка загрузки информации о шаблоне', error);
        setIsPreviewLoading(false);
      });
  };

  const closeTemplateViewer = () => {
    setPreviewTemplate(null);
    setTemplateSlideIndex(0);
    setTemplatePageCount(0);
    replacePreviewUrl(null);
  };

  const createPresentationFromTemplate = async () => {
    if (!previewTemplate) {
      return;
    }

    const savedPresentation = await addPresentationFromTemplate(previewTemplate.id);
    if (!savedPresentation) {
      return;
    }

    closeTemplateViewer();
    await openPresentation(savedPresentation.id);
  };

  const previousTemplateSlide = () => {
    if (!previewTemplate || templateSlideIndex === 0) {
      return;
    }

    loadTemplatePreview(previewTemplate, templateSlideIndex - 1);
  };

  const nextTemplateSlide = () => {
    if (!previewTemplate || templateSlideIndex >= templatePageCount - 1) {
      return;
    }

    loadTemplatePreview(previewTemplate, templateSlideIndex + 1);
  };

  const renameActiveTemplate = async (title) => {
    if (!previewTemplate) {
      return;
    }

    setPreviewTemplate((currentTemplate) => ({ ...currentTemplate, title }));
    const savedTemplate = await renameTemplate(previewTemplate.id, title);
    if (savedTemplate) {
      setPreviewTemplate(savedTemplate);
    }
  };

  if (!activePresentation) {
    if (previewTemplate) {
      return (
        <TemplateViewer
          template={previewTemplate}
          previewUrl={previewUrl}
          pageCount={templatePageCount}
          slideIndex={templateSlideIndex}
          isPreviewLoading={isPreviewLoading}
          onRenameTemplate={renameActiveTemplate}
          onClose={closeTemplateViewer}
          onCreatePresentation={createPresentationFromTemplate}
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
        onAddPresentation={createAndOpenPresentation}
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
            slideState={slideState}
            onAddSlide={addSlide}
            onCloseEditor={closePresentationEditor}
            onDeleteSlide={deleteSlide}
            onDownloadPresentation={downloadPresentation}
            onNextSlide={nextSlide}
            onPreviousSlide={previousSlide}
            onRenamePresentation={renameActivePresentation}
          />

          <DrawingCanvas
              key={activePresentation.id}
              ref={drawingCanvasRef}
              initialSlides={activePresentation.slides}
              onSlideStateChange={setSlideState}
          />
        </section>
      </main>
  );
}
