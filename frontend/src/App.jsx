import { useRef, useState } from 'react';
import DrawingCanvas from './components/DrawingCanvas.jsx';

const createEmptyPresentation = (index) => ({
  id: crypto.randomUUID(),
  title: `Презентация ${index}`,
  slides: null,
});

export default function App() {
  const drawingCanvasRef = useRef(null);
  const [presentations, setPresentations] = useState([createEmptyPresentation(1)]);
  const [activePresentationId, setActivePresentationId] = useState(null);
  const [slideState, setSlideState] = useState({ activeSlideIndex: 0, slideCount: 1 });

  const activePresentation = presentations.find((presentation) => presentation.id === activePresentationId);

  const syncActivePresentation = () => {
    if (!activePresentationId || !drawingCanvasRef.current) {
      return presentations;
    }

    const slides = drawingCanvasRef.current.getSlides();
    const nextPresentations = presentations.map((presentation) =>
        presentation.id === activePresentationId
            ? { ...presentation, slides }
            : presentation
    );

    setPresentations(nextPresentations);
    return nextPresentations;
  };

  const addPresentation = () => {
    const nextPresentation = createEmptyPresentation(presentations.length + 1);
    setPresentations([...presentations, nextPresentation]);
  };

  const deletePresentation = (presentationId) => {
    setPresentations(presentations.filter((presentation) => presentation.id !== presentationId));
  };

  const openPresentation = (presentationId) => {
    syncActivePresentation();
    setActivePresentationId(presentationId);
    setSlideState({ activeSlideIndex: 0, slideCount: 1 });
  };

  const closeEditor = () => {
    syncActivePresentation();
    setActivePresentationId(null);
    setSlideState({ activeSlideIndex: 0, slideCount: 1 });
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

  if (!activePresentation) {
    return (
        <main className="app-shell">
          <section className="workspace">
            <header className="workspace-header">
              <h1>Презентации</h1>
              <button className="primary-button" type="button" onClick={addPresentation}>
                Добавить презентацию
              </button>
            </header>

            <section className="presentation-list" aria-label="Список презентаций">
              {presentations.map((presentation) => (
                  <article className="presentation-item" key={presentation.id}>
                    <div>
                      <h2>{presentation.title}</h2>
                      <p>{presentation.slides?.length || 1} слайд</p>
                    </div>
                    <div className="presentation-actions">
                      <button
                          className="primary-button"
                          type="button"
                          onClick={() => openPresentation(presentation.id)}
                      >
                        Открыть
                      </button>
                      <button
                          className="secondary-button"
                          type="button"
                          onClick={() => deletePresentation(presentation.id)}
                      >
                        Удалить
                      </button>
                    </div>
                  </article>
              ))}

              {presentations.length === 0 && (
                  <div className="empty-state">
                    <p>Презентаций пока нет.</p>
                    <button className="primary-button" type="button" onClick={addPresentation}>
                      Добавить презентацию
                    </button>
                  </div>
              )}
            </section>
          </section>
        </main>
    );
  }

  return (
      <main className="app-shell">
        <section className="workspace">
          <header className="workspace-header">
            <div>
              <div className="title-row">
                <h1>Редактор презентаций</h1>
                <div className="slide-controls">
                  <button
                      className="secondary-button"
                      type="button"
                      onClick={addSlide}
                  >
                    Добавить слайд
                  </button>
                  <button
                      className="secondary-button"
                      type="button"
                      onClick={deleteSlide}
                      disabled={slideState.slideCount === 1}
                  >
                    Удалить слайд
                  </button>
                  <div className="slide-nav" aria-label="Навигация по слайдам">
                    <button
                        className="secondary-button"
                        type="button"
                        onClick={previousSlide}
                        disabled={slideState.activeSlideIndex === 0}
                    >
                      Назад
                    </button>
                    <span>Слайд {slideState.activeSlideIndex + 1} из {slideState.slideCount}</span>
                    <button
                        className="secondary-button"
                        type="button"
                        onClick={nextSlide}
                        disabled={slideState.activeSlideIndex === slideState.slideCount - 1}
                    >
                      Вперед
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="header-actions">
              <button className="secondary-button" type="button" onClick={closeEditor}>
                К списку
              </button>
              <button className="primary-button" type="button" onClick={downloadPresentation}>
                Скачать PPTX
              </button>
            </div>
          </header>

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
