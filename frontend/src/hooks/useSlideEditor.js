import { useEffect, useState } from 'react';
import { clearCanvas, drawImageOnCanvas, getCanvasPoint, restoreCanvasSnapshot } from '../canvas.js';
import { createEmptySlide, DEFAULT_STROKE_COLOR } from '../slide.js';
import { downloadBlob } from '../download.js';

export default function useSlideEditor({ canvasRef, initialSlides, onSlideStateChange }) {
  const [slides, setSlides] = useState(() =>
    initialSlides?.length ? initialSlides : [createEmptySlide()]
  );
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokeColor, setStrokeColor] = useState(DEFAULT_STROKE_COLOR);
  const [lineWidth, setLineWidth] = useState(4);
  const [status, setStatus] = useState('');
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    const slide = slides[activeSlideIndex];
    const canvas = canvasRef.current;

    if (!slide || !canvas) {
      return;
    }

    setText(slide.text || '');
    setStrokeColor(slide.textColor || DEFAULT_STROKE_COLOR);
    setHistory(slide.history || []);
    setRedoStack(slide.redoStack || []);
    drawImageOnCanvas(canvas, slide.image);
  }, [activeSlideIndex, canvasRef, slides]);

  useEffect(() => {
    onSlideStateChange?.({
      activeSlideIndex,
      slideCount: slides.length,
    });
  }, [activeSlideIndex, onSlideStateChange, slides.length]);

  const getSlidePayload = () => {
    const canvas = canvasRef.current;

    return {
      image: canvas.toDataURL('image/png'),
      text,
      textColor: strokeColor,
      history,
      redoStack,
    };
  };

  const getSyncedSlides = () => {
    const nextSlides = [...slides];
    nextSlides[activeSlideIndex] = getSlidePayload();
    return nextSlides;
  };

  const addSlide = () => {
    const nextSlides = [...getSyncedSlides(), createEmptySlide()];
    setSlides(nextSlides);
    setActiveSlideIndex(nextSlides.length - 1);
    setStatus('');
  };

  const deleteSlide = () => {
    if (slides.length === 1) {
      return;
    }

    const nextSlides = getSyncedSlides().filter((_, index) => index !== activeSlideIndex);
    setSlides(nextSlides);
    setActiveSlideIndex(Math.min(activeSlideIndex, nextSlides.length - 1));
    setStatus('');
  };

  const openSlide = (nextIndex) => {
    if (nextIndex < 0 || nextIndex >= slides.length || nextIndex === activeSlideIndex) {
      return;
    }

    setSlides(getSyncedSlides());
    setActiveSlideIndex(nextIndex);
    setStatus('');
  };

  const startDrawing = (event) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCanvasPoint(canvas, event);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (event) => {
    if (!isDrawing) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCanvasPoint(canvas, event);

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) {
      return;
    }

    setIsDrawing(false);
    setHistory((currentHistory) => [...currentHistory, canvasRef.current.toDataURL()]);
    setRedoStack([]);
  };

  const undo = () => {
    const canvas = canvasRef.current;

    if (history.length === 0) {
      return;
    }

    const currentSnapshot = history[history.length - 1];
    const nextHistory = history.slice(0, -1);
    const previousSnapshot = nextHistory[nextHistory.length - 1] || slides[activeSlideIndex].image;

    setHistory(nextHistory);
    setRedoStack((currentRedoStack) => [...currentRedoStack, currentSnapshot]);
    restoreCanvasSnapshot(canvas, previousSnapshot);
  };

  const redo = () => {
    const canvas = canvasRef.current;

    if (redoStack.length === 0) {
      return;
    }

    const restoredSnapshot = redoStack[redoStack.length - 1];

    setRedoStack((currentRedoStack) => currentRedoStack.slice(0, -1));
    setHistory((currentHistory) => [...currentHistory, restoredSnapshot]);
    restoreCanvasSnapshot(canvas, restoredSnapshot);
  };

  const resetCanvas = () => {
    clearCanvas(canvasRef.current);
    setHistory([]);
    setRedoStack([]);
    setText('');
    setStatus('');
  };

  const downloadPresentation = async () => {
    try {
      setStatus('Готовим PPTX...');
      const response = await fetch('/api/presentation/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slides: getSyncedSlides() }),
      });

      if (!response.ok) {
        throw new Error('Не удалось скачать PPTX');
      }

      downloadBlob(await response.blob(), 'generated_report.pptx');
      setStatus('PPTX скачан');
    } catch (err) {
      console.error('Ошибка скачивания PPTX', err);
      setStatus('Ошибка скачивания PPTX');
    }
  };

  return {
    addSlide,
    canRedo: redoStack.length > 0,
    canUndo: history.length > 0,
    deleteSlide,
    downloadPresentation,
    draw,
    getSyncedSlides,
    lineWidth,
    nextSlide: () => openSlide(activeSlideIndex + 1),
    previousSlide: () => openSlide(activeSlideIndex - 1),
    redo,
    resetCanvas,
    setLineWidth,
    setStrokeColor,
    setText,
    startDrawing,
    status,
    stopDrawing,
    strokeColor,
    text,
    undo,
  };
}
