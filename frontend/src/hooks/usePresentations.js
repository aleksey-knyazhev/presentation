import { useEffect, useMemo, useState } from 'react';
import {
  createPresentation,
  deletePresentation as deletePresentationRequest,
  findPresentations,
  updatePresentation,
} from '../api.js';
import { createEmptyPresentation } from '../presentation.js';

const initialSlideState = { activeSlideIndex: 0, slideCount: 1 };

export default function usePresentations(drawingCanvasRef) {
  const [presentations, setPresentations] = useState([]);
  const [activePresentationId, setActivePresentationId] = useState(null);
  const [slideState, setSlideState] = useState(initialSlideState);

  useEffect(() => {
    findPresentations()
      .then(setPresentations)
      .catch((error) => console.error('Ошибка загрузки презентаций', error));
  }, []);

  const activePresentation = useMemo(
    () => presentations.find((presentation) => presentation.id === activePresentationId),
    [activePresentationId, presentations]
  );

  const resetSlideState = () => {
    setSlideState(initialSlideState);
  };

  const syncActivePresentation = async () => {
    if (!activePresentationId || !drawingCanvasRef.current) {
      return;
    }

    const slides = drawingCanvasRef.current.getSlides();
    const presentationToSave = presentations.find((presentation) => presentation.id === activePresentationId);

    if (!presentationToSave) {
      return;
    }

    const nextPresentation = { ...presentationToSave, slides };

    setPresentations((currentPresentations) =>
      currentPresentations.map((presentation) =>
        presentation.id === activePresentationId
          ? nextPresentation
          : presentation
      )
    );

    try {
      await updatePresentation(nextPresentation);
    } catch (error) {
      console.error('Ошибка сохранения презентации', error);
    }
  };

  const addPresentation = async () => {
    const nextPresentation = createEmptyPresentation(presentations.length + 1);

    try {
      const savedPresentation = await createPresentation(nextPresentation);
      setPresentations((currentPresentations) => [...currentPresentations, savedPresentation]);
    } catch (error) {
      console.error('Ошибка создания презентации', error);
    }
  };

  const deletePresentation = async (presentationId) => {
    try {
      await deletePresentationRequest(presentationId);
      setPresentations((currentPresentations) =>
        currentPresentations.filter((presentation) => presentation.id !== presentationId)
      );
    } catch (error) {
      console.error('Ошибка удаления презентации', error);
    }
  };

  const openPresentation = async (presentationId) => {
    await syncActivePresentation();
    setActivePresentationId(presentationId);
    resetSlideState();
  };

  const closeEditor = async () => {
    await syncActivePresentation();
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
