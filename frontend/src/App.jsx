import { useRef } from 'react';
import DrawingCanvas from './components/DrawingCanvas.jsx';
import PresentationEditorHeader from './components/PresentationEditorHeader.jsx';
import PresentationList from './components/PresentationList.jsx';
import usePresentations from './hooks/usePresentations.js';

export default function App() {
  const drawingCanvasRef = useRef(null);
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
    return (
      <PresentationList
        presentations={presentations}
        onAddPresentation={addPresentation}
        onDeletePresentation={deletePresentation}
        onOpenPresentation={openPresentation}
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
