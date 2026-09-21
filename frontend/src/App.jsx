import { useRef, useState } from 'react';
import DrawingCanvas from './components/DrawingCanvas.jsx';

export default function App() {
  const drawingCanvasRef = useRef(null);
  const [slideState, setSlideState] = useState({ activeSlideIndex: 0, slideCount: 1 });

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
            <button className="primary-button" type="button" onClick={downloadPresentation}>
              Скачать PPTX
            </button>
          </header>

          <DrawingCanvas ref={drawingCanvasRef} onSlideStateChange={setSlideState} />
        </section>
      </main>
  );
}
