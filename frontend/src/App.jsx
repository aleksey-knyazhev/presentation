import { useRef, useState } from 'react';
import DrawingCanvas from './components/DrawingCanvas.jsx';
import PresentationEditorHeader from './components/PresentationEditorHeader.jsx';
import PresentationList from './components/PresentationList.jsx';
import TemplateList from './components/TemplateList.jsx';
import usePresentations from './hooks/usePresentations.js';
import useTemplates from './hooks/useTemplates.js';

export default function App() {
  const drawingCanvasRef = useRef(null);
  const [activeSection, setActiveSection] = useState('presentations');
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

  if (!activePresentation) {
    if (activeSection === 'templates') {
      return (
        <TemplateList
          templates={templates}
          onAddTemplate={addTemplate}
          onDeleteTemplate={deleteTemplate}
          onOpenPresentations={() => setActiveSection('presentations')}
          onOpenTemplates={() => setActiveSection('templates')}
        />
      );
    }

    return (
      <PresentationList
        presentations={presentations}
        onAddPresentation={addPresentation}
        onDeletePresentation={deletePresentation}
        onOpenPresentations={() => setActiveSection('presentations')}
        onOpenPresentation={openPresentation}
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
            onCloseEditor={closeEditor}
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
