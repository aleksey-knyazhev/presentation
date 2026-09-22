import { useRef, useState } from 'react';
import DrawingCanvas from './components/DrawingCanvas.jsx';
import PresentationEditorHeader from './components/PresentationEditorHeader.jsx';
import PresentationList from './components/PresentationList.jsx';
import TemplateList from './components/TemplateList.jsx';
import TemplateViewer from './components/TemplateViewer.jsx';
import usePresentations from './hooks/usePresentations.js';
import useTemplatePreview from './hooks/useTemplatePreview.js';
import useTemplates from './hooks/useTemplates.js';

export default function App() {
  const drawingCanvasRef = useRef(null);
  const [activeSection, setActiveSection] = useState('presentations');
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
  const templatePreview = useTemplatePreview(renameTemplate);

  const handleDownloadPresentation = () => {
    drawingCanvasRef.current?.downloadPresentation();
  };

  const handleAddSlide = () => {
    drawingCanvasRef.current?.addSlide();
  };

  const handleDeleteSlide = () => {
    drawingCanvasRef.current?.deleteSlide();
  };

  const handlePreviousSlide = () => {
    drawingCanvasRef.current?.previousSlide();
  };

  const handleNextSlide = () => {
    drawingCanvasRef.current?.nextSlide();
  };

  const handleClosePresentationEditor = async () => {
    templatePreview.closeTemplate();
    setActiveSection('presentations');
    await closeEditor();
  };

  const handleOpenPresentationEditor = async (presentationId) => {
    templatePreview.closeTemplate();
    await openPresentation(presentationId);
  };

  const handleCreatePresentation = async () => {
    const savedPresentation = await addPresentation();
    if (!savedPresentation) {
      return;
    }

    await handleOpenPresentationEditor(savedPresentation.id);
  };

  const handleCreatePresentationFromTemplate = async () => {
    if (!templatePreview.previewTemplate) {
      return;
    }

    const savedPresentation = await addPresentationFromTemplate(templatePreview.previewTemplate.id);
    if (!savedPresentation) {
      return;
    }

    templatePreview.closeTemplate();
    await openPresentation(savedPresentation.id);
  };

  if (!activePresentation) {
    if (templatePreview.previewTemplate) {
      return (
        <TemplateViewer
          template={templatePreview.previewTemplate}
          previewUrl={templatePreview.previewUrl}
          pageCount={templatePreview.pageCount}
          slideIndex={templatePreview.slideIndex}
          isPreviewLoading={templatePreview.isPreviewLoading}
          onRenameTemplate={templatePreview.renameActiveTemplate}
          onClose={templatePreview.closeTemplate}
          onCreatePresentation={handleCreatePresentationFromTemplate}
          onPreviousSlide={templatePreview.previousSlide}
          onNextSlide={templatePreview.nextSlide}
        />
      );
    }

    if (activeSection === 'templates') {
      return (
        <TemplateList
          templates={templates}
          onAddTemplate={addTemplate}
          onDeleteTemplate={deleteTemplate}
          onOpenTemplate={templatePreview.openTemplate}
          onOpenPresentations={() => setActiveSection('presentations')}
          onOpenTemplates={() => setActiveSection('templates')}
          isPreviewLoading={templatePreview.isPreviewLoading}
        />
      );
    }

    return (
      <PresentationList
        presentations={presentations}
        onAddPresentation={handleCreatePresentation}
        onDeletePresentation={deletePresentation}
        onOpenPresentations={() => setActiveSection('presentations')}
        onOpenPresentation={handleOpenPresentationEditor}
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
          onAddSlide={handleAddSlide}
          onCloseEditor={handleClosePresentationEditor}
          onDeleteSlide={handleDeleteSlide}
          onDownloadPresentation={handleDownloadPresentation}
          onNextSlide={handleNextSlide}
          onPreviousSlide={handlePreviousSlide}
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
