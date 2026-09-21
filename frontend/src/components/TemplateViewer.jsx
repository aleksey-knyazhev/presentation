export default function TemplateViewer({
  isPreviewLoading,
  onClose,
  onNextSlide,
  onPreviousSlide,
  pageCount,
  previewUrl,
  slideIndex,
  template,
}) {
  const slideCount = pageCount || template.slideCount || 1;

  return (
    <main className="app-shell">
      <section className="workspace">
        <header className="workspace-header">
          <div>
            <h1>Шаблон</h1>
            <div className="slide-nav template-viewer-nav" aria-label="Навигация по слайдам шаблона">
              <span className="template-title">{template.title}</span>
              <button
                className="secondary-button"
                type="button"
                onClick={onPreviousSlide}
                disabled={isPreviewLoading || slideIndex === 0}
              >
                Назад
              </button>
              <span>Слайд {slideIndex + 1} из {slideCount || 1}</span>
              <button
                className="secondary-button"
                type="button"
                onClick={onNextSlide}
                disabled={isPreviewLoading || slideIndex >= slideCount - 1}
              >
                Вперед
              </button>
            </div>
          </div>
          <div className="header-actions">
            <button className="secondary-button" type="button" onClick={onClose}>
              К списку
            </button>
          </div>
        </header>

        <section className="preview-panel template-viewer-panel" aria-label="Превью шаблона">
          {isPreviewLoading && <p className="status-line">Загрузка превью...</p>}
          {previewUrl && <img src={previewUrl} alt="Превью шаблона" />}
        </section>
      </section>
    </main>
  );
}
