import { useEffect, useState } from 'react';
import {
  createTemplate,
  deleteTemplate as deleteTemplateRequest,
  findTemplates,
  updateTemplate,
} from '../api.js';

export default function useTemplates() {
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    findTemplates()
      .then(setTemplates)
      .catch((error) => console.error('Ошибка загрузки шаблонов', error));
  }, []);

  const addTemplate = async (file) => {
    if (!file) {
      return;
    }

    try {
      const savedTemplate = await createTemplate(file);
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

  const renameTemplate = async (templateId, title) => {
    const nextTitle = title || 'Новый шаблон';
    setTemplates((currentTemplates) =>
      currentTemplates.map((template) =>
        template.id === templateId ? { ...template, title: nextTitle } : template
      )
    );

    try {
      const savedTemplate = await updateTemplate({ id: templateId, title: nextTitle });
      setTemplates((currentTemplates) =>
        currentTemplates.map((template) =>
          template.id === templateId ? savedTemplate : template
        )
      );
      return savedTemplate;
    } catch (error) {
      console.error('Ошибка переименования шаблона', error);
      return null;
    }
  };

  return {
    addTemplate,
    deleteTemplate,
    renameTemplate,
    templates,
  };
}
