export default function DrawingToolbar({
  canRedo,
  canUndo,
  lineWidth,
  onClearCanvas,
  onRedo,
  onStrokeColorChange,
  onUndo,
  onLineWidthChange,
  strokeColor,
}) {
  return (
    <div className="toolbar" aria-label="Настройки кисти">
      <label className="control">
        Цвет
        <input
          type="color"
          value={strokeColor}
          onChange={(event) => onStrokeColorChange(event.target.value)}
        />
      </label>
      <label className="control range-control">
        Толщина
        <input
          type="range"
          min="1"
          max="24"
          value={lineWidth}
          onChange={(event) => onLineWidthChange(Number(event.target.value))}
        />
        <span>{lineWidth}px</span>
      </label>

      <button className="secondary-button" type="button" onClick={onUndo} disabled={!canUndo}>
        Отменить
      </button>

      <button className="secondary-button" type="button" onClick={onRedo} disabled={!canRedo}>
        Вернуть
      </button>

      <button className="secondary-button" type="button" onClick={onClearCanvas}>
        Очистить
      </button>
    </div>
  );
}
