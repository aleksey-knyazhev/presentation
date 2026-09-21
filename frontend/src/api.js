const requestJson = async (url, options = {}) => {
  const isFormData = options.body instanceof FormData;
  const response = await fetch(url, {
    headers: isFormData
      ? options.headers
      : { 'Content-Type': 'application/json', ...options.headers },
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

export const findTemplates = () => requestJson('/api/templates');

export const createTemplate = (file) => {
  const formData = new FormData();
  formData.append('file', file);

  return requestJson('/api/templates', {
    method: 'POST',
    headers: {},
    body: formData,
  });
};

export const deleteTemplate = async (templateId) => {
  await requestJson(`/api/templates/${templateId}`, {
    method: 'DELETE',
  });
};
