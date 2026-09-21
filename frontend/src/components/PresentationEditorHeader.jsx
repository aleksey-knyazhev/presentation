export default function PresentationEditorHeader({
  presentationTitle,
  slideState,
  onAddSlide,
  onCloseEditor,
  onDeleteSlide,
  onDownloadPresentation,
  onNextSlide,
  onPreviousSlide,
  onRenamePresentation,
}) {
  return (
    <header className="workspace-header">
      <div>
        <h1>Редактор презентации</h1>
        <div className="title-row">
          <input
            className="presentation-title-input"
            aria-label="Название презентации"
            value={presentationTitle}
            onChange={(event) => onRenamePresentation(event.target.value)}
          />
          <div className="slide-controls">
            <button className="secondary-button" type="button" onClick={onAddSlide}>
              Добавить слайд
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={onDeleteSlide}
              disabled={slideState.slideCount === 1}
            >
              Удалить слайд
            </button>
            <div className="slide-nav" aria-label="Навигация по слайдам">
              <button
                className="secondary-button"
                type="button"
                onClick={onPreviousSlide}
                disabled={slideState.activeSlideIndex === 0}
              >
                Назад
              </button>
              <span>Слайд {slideState.activeSlideIndex + 1} из {slideState.slideCount}</span>
              <button
                className="secondary-button"
                type="button"
                onClick={onNextSlide}
                disabled={slideState.activeSlideIndex === slideState.slideCount - 1}
              >
                Вперед
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="header-actions">
        <button className="secondary-button" type="button" onClick={onCloseEditor}>
          К списку
        </button>
        <button className="primary-button" type="button" onClick={onDownloadPresentation}>
          Скачать PPTX
        </button>
      </div>
    </header>
  );
}
