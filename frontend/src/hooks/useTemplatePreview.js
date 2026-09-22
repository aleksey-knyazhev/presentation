import { useEffect, useRef, useState } from 'react';
import {
  createTemplatePreview,
  getTemplatePreviewInfo,
} from '../api.js';

export default function useTemplatePreview(renameTemplate) {
  const previewUrlRef = useRef(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }
  }, []);

  const replacePreviewUrl = (url) => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }

    previewUrlRef.current = url;
    setPreviewUrl(url);
  };

  const loadPreview = async (template, nextSlideIndex) => {
    setIsPreviewLoading(true);
    try {
      const blob = await createTemplatePreview(template.id, nextSlideIndex);

      replacePreviewUrl(URL.createObjectURL(blob));
      setPreviewTemplate(template);
      setSlideIndex(nextSlideIndex);
    } catch (error) {
      console.error('Ошибка открытия шаблона', error);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const openTemplate = (template) => {
    setIsPreviewLoading(true);
    getTemplatePreviewInfo(template.id)
      .then((info) => {
        setPageCount(info.pageCount || template.slideCount || 1);
        return loadPreview(template, 0);
      })
      .catch((error) => {
        console.error('Ошибка загрузки информации о шаблоне', error);
        setIsPreviewLoading(false);
      });
  };

  const closeTemplate = () => {
    setPreviewTemplate(null);
    setPageCount(0);
    setSlideIndex(0);
    replacePreviewUrl(null);
  };

  const previousSlide = () => {
    if (!previewTemplate || slideIndex === 0) {
      return;
    }

    loadPreview(previewTemplate, slideIndex - 1);
  };

  const nextSlide = () => {
    if (!previewTemplate || slideIndex >= pageCount - 1) {
      return;
    }

    loadPreview(previewTemplate, slideIndex + 1);
  };

  const renameActiveTemplate = async (title) => {
    if (!previewTemplate) {
      return;
    }

    setPreviewTemplate((currentTemplate) => ({ ...currentTemplate, title }));
    const savedTemplate = await renameTemplate(previewTemplate.id, title);
    if (savedTemplate) {
      setPreviewTemplate(savedTemplate);
    }
  };

  return {
    closeTemplate,
    isPreviewLoading,
    nextSlide,
    openTemplate,
    pageCount,
    previewTemplate,
    previewUrl,
    previousSlide,
    renameActiveTemplate,
    slideIndex,
  };
}
