import { useMemo, useState } from 'react';
import { createEmptyPresentation } from '../presentation.js';

const initialSlideState = { activeSlideIndex: 0, slideCount: 1 };

export default function usePresentations(drawingCanvasRef) {
  const [presentations, setPresentations] = useState([createEmptyPresentation(1)]);
  const [activePresentationId, setActivePresentationId] = useState(null);
  const [slideState, setSlideState] = useState(initialSlideState);

  const activePresentation = useMemo(
    () => presentations.find((presentation) => presentation.id === activePresentationId),
    [activePresentationId, presentations]
  );

  const resetSlideState = () => {
    setSlideState(initialSlideState);
  };

  const syncActivePresentation = () => {
    if (!activePresentationId || !drawingCanvasRef.current) {
      return;
    }

    const slides = drawingCanvasRef.current.getSlides();
    setPresentations((currentPresentations) =>
      currentPresentations.map((presentation) =>
        presentation.id === activePresentationId
          ? { ...presentation, slides }
          : presentation
      )
    );
  };

  const addPresentation = () => {
    setPresentations((currentPresentations) => [
      ...currentPresentations,
      createEmptyPresentation(currentPresentations.length + 1),
    ]);
  };

  const deletePresentation = (presentationId) => {
    setPresentations((currentPresentations) =>
      currentPresentations.filter((presentation) => presentation.id !== presentationId)
    );
  };

  const openPresentation = (presentationId) => {
    syncActivePresentation();
    setActivePresentationId(presentationId);
    resetSlideState();
  };

  const closeEditor = () => {
    syncActivePresentation();
    setActivePresentationId(null);
    resetSlideState();
  };

  const renameActivePresentation = (title) => {
    setPresentations((currentPresentations) =>
      currentPresentations.map((presentation) =>
        presentation.id === activePresentationId
          ? { ...presentation, title }
          : presentation
      )
    );
  };

  return {
    activePresentation,
    addPresentation,
    closeEditor,
    deletePresentation,
    openPresentation,
    presentations,
    renameActivePresentation,
    setSlideState,
    slideState,
  };
}
