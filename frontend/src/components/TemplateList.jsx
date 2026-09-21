import SectionNav from './SectionNav.jsx';

export default function TemplateList({
  onAddTemplate,
  onDeleteTemplate,
  onOpenPresentations,
  onOpenTemplates,
  templates,
}) {
  return (
    <main className="app-shell">
      <section className="workspace">
        <header className="workspace-header">
          <div>
            <SectionNav
              activeSection="templates"
              onOpenPresentations={onOpenPresentations}
              onOpenTemplates={onOpenTemplates}
            />
            <h1>Шаблоны</h1>
          </div>
          <button className="primary-button" type="button" onClick={onAddTemplate}>
            Добавить шаблон
          </button>
        </header>

        <section className="presentation-list" aria-label="Список шаблонов">
          {templates.map((template) => (
            <article className="presentation-item" key={template.id}>
              <div>
                <h2>{template.title}</h2>
                <p>{template.description || 'Описание не задано'}</p>
              </div>
              <div className="presentation-actions">
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => onDeleteTemplate(template.id)}
                >
                  Удалить
                </button>
              </div>
            </article>
          ))}

          {templates.length === 0 && (
            <div className="empty-state">
              <p>Шаблонов пока нет</p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
