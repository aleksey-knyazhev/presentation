const requestJson = async (url, options = {}) => {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};

export const findPresentations = () => requestJson('/api/presentations');

export const createPresentation = (presentation) =>
  requestJson('/api/presentations', {
    method: 'POST',
    body: JSON.stringify(presentation),
  });

export const updatePresentation = (presentation) =>
  requestJson(`/api/presentations/${presentation.id}`, {
    method: 'PUT',
    body: JSON.stringify(presentation),
  });

export const deletePresentation = async (presentationId) => {
  await requestJson(`/api/presentations/${presentationId}`, {
    method: 'DELETE',
  });
};
