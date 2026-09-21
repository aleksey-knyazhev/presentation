import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

const createEmptySlide = () => ({
    image: null,
    text: '',
    textColor: '#1f2937',
    history: [],
    redoStack: [],
});

const DrawingCanvas = forwardRef(function DrawingCanvas({ initialSlides, onSlideStateChange }, ref) {
    const canvasRef = useRef(null);
    const [slides, setSlides] = useState(() =>
        initialSlides?.length ? initialSlides : [createEmptySlide()]
    );
    const [activeSlideIndex, setActiveSlideIndex] = useState(0);
    const [isDrawing, setIsDrawing] = useState(false);
    const [strokeColor, setStrokeColor] = useState('#1f2937');
    const [lineWidth, setLineWidth] = useState(4);
    const [status, setStatus] = useState('');

    // Состояния для хранения истории шагов
    const [history, setHistory] = useState([]);   // Стек для Отмены (Undo)
    const [redoStack, setRedoStack] = useState([]); // Стек для Возврата (Redo)

    const [text, setText] = useState('');
    const [textX] = useState(50);
    const [textY] = useState(50);

    useEffect(() => {
        const slide = slides[activeSlideIndex];
        if (!slide) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setText(slide.text || '');
        setStrokeColor(slide.textColor || '#1f2937');
        setHistory(slide.history || []);
        setRedoStack(slide.redoStack || []);

        if (!slide.image) {
            return;
        }

        const img = new Image();
        img.src = slide.image;
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };
    }, [activeSlideIndex, slides]);

    useEffect(() => {
        onSlideStateChange?.({
            activeSlideIndex,
            slideCount: slides.length,
        });
    }, [activeSlideIndex, slides.length]);

    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const { x, y } = getCanvasPoint(e);

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.moveTo(x, y);
        setIsDrawing(true);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const { x, y } = getCanvasPoint(e);

        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        if (!isDrawing) return;
        setIsDrawing(false);

        const canvas = canvasRef.current;
        // Сохраняем текущий снимок в историю отмены
        setHistory(prev => [...prev, canvas.toDataURL()]);
        // При создании новой линии ветка истории меняется, очищаем стек возврата
        setRedoStack([]);
    };

    // Функция ОТМЕНИТЬ (Undo)
    const undo = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (history.length === 0) return;

        // Забираем последний снимок из истории отмены
        const currentImg = history[history.length - 1];
        const newHistory = history.slice(0, -1);
        setHistory(newHistory);

        // Перекладываем его в стек возврата
        setRedoStack(prev => [...prev, currentImg]);

        // Полностью очищаем холст
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Восстанавливаем снимок, который теперь стал последним в истории
        if (newHistory.length > 0) {
            const previousState = newHistory[newHistory.length - 1];
            const img = new Image();
            img.src = previousState;
            img.onload = () => {
                ctx.drawImage(img, 0, 0);
            };
        }
    };

    // Функция ВЕРНУТЬ (Redo)
    const redo = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (redoStack.length === 0) return;

        // Забираем последний снимок из стека возврата
        const nextImg = redoStack[redoStack.length - 1];
        setRedoStack(prev => prev.slice(0, -1));

        // Возвращаем его обратно в историю отмены
        setHistory(prev => [...prev, nextImg]);

        // Рисуем этот снимок на холсте
        const img = new Image();
        img.src = nextImg;
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };
    };

    const getCanvasPoint = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY,
        };
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHistory([]);
        setRedoStack([]); // Очищаем стек возврата при полной очистке холста
        setText('');
        setStatus('');
    };

    const getSlidePayload = () => {
        const canvas = canvasRef.current;
        return {
            image: canvas.toDataURL('image/png'),
            text,
            textColor: strokeColor,
            history,
            redoStack,
        };
    };

    const getSyncedSlides = () => {
        const nextSlides = [...slides];
        nextSlides[activeSlideIndex] = getSlidePayload();
        return nextSlides;
    };

    const addSlide = () => {
        const nextSlides = [...getSyncedSlides(), createEmptySlide()];
        setSlides(nextSlides);
        setActiveSlideIndex(nextSlides.length - 1);
        setStatus('');
    };

    const deleteSlide = () => {
        if (slides.length === 1) {
            return;
        }

        const nextSlides = getSyncedSlides().filter((_, index) => index !== activeSlideIndex);
        setSlides(nextSlides);
        setActiveSlideIndex(Math.min(activeSlideIndex, nextSlides.length - 1));
        setStatus('');
    };

    const openSlide = (nextIndex) => {
        if (nextIndex < 0 || nextIndex >= slides.length || nextIndex === activeSlideIndex) {
            return;
        }

        setSlides(getSyncedSlides());
        setActiveSlideIndex(nextIndex);
        setStatus('');
    };

    const downloadPresentation = async () => {
        try {
            setStatus('Готовим PPTX...');
            const response = await fetch('/api/presentation/download', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slides: getSyncedSlides() }),
            });

            if (!response.ok) {
                throw new Error('Не удалось скачать PPTX');
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'generated_report.pptx';
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
            setStatus('PPTX скачан');
        } catch (err) {
            console.error('Ошибка скачивания PPTX', err);
            setStatus('Ошибка скачивания PPTX');
        }
    };

    useImperativeHandle(ref, () => ({
        addSlide,
        deleteSlide,
        downloadPresentation,
        getSlides: getSyncedSlides,
        previousSlide: () => openSlide(activeSlideIndex - 1),
        nextSlide: () => openSlide(activeSlideIndex + 1),
    }));

    return (
        <div className="drawing-panel">
            <div className="toolbar" aria-label="Настройки кисти">
                <label className="control">
                    Цвет
                    <input
                        type="color"
                        value={strokeColor}
                        onChange={(e) => setStrokeColor(e.target.value)}
                    />
                </label>
                <label className="control range-control">
                    Толщина
                    <input
                        type="range"
                        min="1"
                        max="24"
                        value={lineWidth}
                        onChange={(e) => setLineWidth(Number(e.target.value))}
                    />
                    <span>{lineWidth}px</span>
                </label>

                {/* Отменить */}
                <button
                    className="secondary-button"
                    type="button"
                    onClick={undo}
                    disabled={history.length === 0}
                >
                    Отменить
                </button>

                {/* Вернуть (Добавлена между Отменить и Очистить) */}
                <button
                    className="secondary-button"
                    type="button"
                    onClick={redo}
                    disabled={redoStack.length === 0}
                >
                    Вернуть
                </button>

                {/* Очистить */}
                <button className="secondary-button" type="button" onClick={clearCanvas}>
                    Очистить
                </button>
            </div>

            <canvas
                ref={canvasRef}
                width={900}
                height={267}
                className="drawing-canvas"
                onPointerDown={startDrawing}
                onPointerMove={draw}
                onPointerUp={stopDrawing}
                onPointerCancel={stopDrawing}
                onPointerLeave={stopDrawing}
            />

            <div className="text-input-container">
                <label htmlFor="canvas-text">Текст на слайде:</label>
                <textarea
                    id="canvas-text"
                    rows="5"
                    placeholder="Введите text (поддерживает перенос строк с помощью Enter)..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
            </div>

            {status && <p className="status-line">{status}</p>}
        </div>
    );
});

export default DrawingCanvas;
