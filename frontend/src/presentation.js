export const createEmptyPresentation = (index) => ({
  id: null,
  title: `Презентация ${index}`,
  slides: null,
});

export const getNextPresentationTitle = (presentations) => {
  const usedTitles = new Set(presentations.map((presentation) => presentation.title));
  let index = presentations.length + 1;

  while (usedTitles.has(`Презентация ${index}`)) {
    index += 1;
  }

  return `Презентация ${index}`;
};
