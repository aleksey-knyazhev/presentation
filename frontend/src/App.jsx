import { useRef } from 'react';
import DrawingCanvas from './components/DrawingCanvas.jsx';

export default function App() {
  const drawingCanvasRef = useRef(null);

  const downloadPresentation = () => {
    drawingCanvasRef.current?.downloadPresentation();
  };

  return (
      <main className="app-shell">
        <section className="workspace">
          <header className="workspace-header">
            <div>
              <p className="eyebrow">PowerPoint generator</p>
              <h1>Редактор слайда</h1>
            </div>
            <button className="primary-button" type="button" onClick={downloadPresentation}>
              Скачать PPTX
            </button>
          </header>

          <DrawingCanvas ref={drawingCanvasRef} />
        </section>
      </main>
  );
}
