export const createEmptyPresentation = (index) => ({
  id: crypto.randomUUID(),
  title: `Презентация ${index}`,
  slides: null,
});
