export default function SectionNav({ activeSection, onOpenPresentations, onOpenTemplates }) {
  return (
    <nav className="section-nav" aria-label="Разделы">
      <button
        className={activeSection === 'presentations' ? 'section-nav-button active' : 'section-nav-button'}
        type="button"
        onClick={onOpenPresentations}
      >
        Презентации
      </button>
      <button
        className={activeSection === 'templates' ? 'section-nav-button active' : 'section-nav-button'}
        type="button"
        onClick={onOpenTemplates}
      >
        Шаблоны
      </button>
    </nav>
  );
}
