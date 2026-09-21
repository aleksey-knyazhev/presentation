import SectionNav from './SectionNav.jsx';

export default function PresentationList({
  presentations,
  onAddPresentation,
  onDeletePresentation,
  onOpenPresentations,
  onOpenPresentation,
  onOpenTemplates,
}) {
  return (
    <main className="app-shell">
      <section className="workspace">
        <header className="workspace-header">
          <div>
            <SectionNav
              activeSection="presentations"
              onOpenPresentations={onOpenPresentations}
              onOpenTemplates={onOpenTemplates}
            />
            <h1>Презентации</h1>
          </div>
          <button className="primary-button" type="button" onClick={onAddPresentation}>
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
                  className="secondary-button"
                  type="button"
                  onClick={() => onOpenPresentation(presentation.id)}
                >
                  Открыть
                </button>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => onDeletePresentation(presentation.id)}
                >
                  Удалить
                </button>
              </div>
            </article>
          ))}

          {presentations.length === 0 && (
            <div className="empty-state">
              <p>Презентаций пока нет</p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
