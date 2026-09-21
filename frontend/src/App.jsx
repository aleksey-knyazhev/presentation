import DrawingCanvas from './components/DrawingCanvas.jsx';

export default function App() {
  const downloadPresentation = () => {
    window.location.href = '/api/presentation/download';
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

        <DrawingCanvas />
      </section>
    </main>
  );
}
