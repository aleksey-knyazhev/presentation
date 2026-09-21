import SectionNav from './SectionNav.jsx';

export default function TemplateList({
  onAddTemplate,
  onDeleteTemplate,
  onOpenTemplate,
  onOpenPresentations,
  onOpenTemplates,
  previewTemplate,
  previewUrl,
  isPreviewLoading,
  templates,
}) {
  const uploadTemplate = (event) => {
    const file = event.target.files?.[0];
    onAddTemplate(file);
    event.target.value = '';
  };

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
          <label className="primary-button file-button">
            Добавить шаблон
            <input type="file" accept=".potx" onChange={uploadTemplate} />
          </label>
        </header>

        <section className="presentation-list" aria-label="Список шаблонов">
          {templates.map((template) => (
            <article className="presentation-item" key={template.id}>
              <div>
                <h2>{template.title}</h2>
                <p>{template.fileName || 'Файл не задан'}</p>
                <p>{template.slideCount ?? 0} стр.</p>
              </div>
              <div className="presentation-actions">
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => onOpenTemplate(template)}
                  disabled={isPreviewLoading}
                >
                  Открыть
                </button>
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

        {previewUrl && (
          <section className="preview-panel" aria-label="Превью шаблона">
            <div className="preview-header">
              <h2>{previewTemplate?.title || 'Превью шаблона'}</h2>
              <span>{isPreviewLoading ? 'Загрузка...' : 'Слайд 1'}</span>
            </div>
            <img src={previewUrl} alt="Превью шаблона" />
          </section>
        )}
      </section>
    </main>
  );
}
