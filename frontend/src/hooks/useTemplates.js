import { useEffect, useState } from 'react';
import {
  createTemplate,
  deleteTemplate as deleteTemplateRequest,
  findTemplates,
} from '../api.js';
import { createEmptyTemplate } from '../template.js';

export default function useTemplates() {
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    findTemplates()
      .then(setTemplates)
      .catch((error) => console.error('Ошибка загрузки шаблонов', error));
  }, []);

  const addTemplate = async () => {
    const nextTemplate = createEmptyTemplate(templates.length + 1);

    try {
      const savedTemplate = await createTemplate(nextTemplate);
      setTemplates((currentTemplates) => [...currentTemplates, savedTemplate]);
    } catch (error) {
      console.error('Ошибка создания шаблона', error);
    }
  };

  const deleteTemplate = async (templateId) => {
    try {
      await deleteTemplateRequest(templateId);
      setTemplates((currentTemplates) =>
        currentTemplates.filter((template) => template.id !== templateId)
      );
    } catch (error) {
      console.error('Ошибка удаления шаблона', error);
    }
  };

  return {
    addTemplate,
    deleteTemplate,
    templates,
  };
}
