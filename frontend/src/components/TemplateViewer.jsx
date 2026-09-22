import { useEffect, useState } from 'react';

export default function TemplateViewer({
  isPreviewLoading,
  onClose,
  onCreatePresentation,
  onNextSlide,
  onPreviousSlide,
  onRenameTemplate,
  pageCount,
  previewUrl,
  slideIndex,
  template,
}) {
  const slideCount = pageCount || template.slideCount || 1;
  const [title, setTitle] = useState(template.title);

  useEffect(() => {
    setTitle(template.title);
  }, [template.title]);

  const saveTitle = () => {
    const nextTitle = title.trim() || 'Новый шаблон';
    setTitle(nextTitle);
    onRenameTemplate(nextTitle);
  };

  const handleTitleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.currentTarget.blur();
    }
  };

  return (
    <main className="app-shell">
      <section className="workspace">
        <header className="workspace-header">
          <div>
            <h1>Шаблон</h1>
            <div className="template-viewer-nav">
              <input
                className="template-title template-title-input"
                aria-label="Название шаблона"
                value={title}
                onBlur={saveTitle}
                onChange={(event) => setTitle(event.target.value)}
                onKeyDown={handleTitleKeyDown}
              />
            </div>
          </div>
          <div className="header-actions">
            <div className="slide-nav" aria-label="Навигация по слайдам шаблона">
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
            <button className="secondary-button" type="button" onClick={onClose}>
              К списку
            </button>
            <button className="primary-button" type="button" onClick={onCreatePresentation}>
              Создать презентацию
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
