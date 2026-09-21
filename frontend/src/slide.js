export const DEFAULT_STROKE_COLOR = '#1f2937';

export const createEmptySlide = () => ({
  image: null,
  text: '',
  textColor: DEFAULT_STROKE_COLOR,
  history: [],
  redoStack: [],
});
