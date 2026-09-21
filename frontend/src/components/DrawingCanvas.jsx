import React, { useRef, useState } from 'react';

export default function DrawingCanvas() {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [strokeColor, setStrokeColor] = useState('#1f2937');
    const [lineWidth, setLineWidth] = useState(4);
    const [status, setStatus] = useState('');

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
        setIsDrawing(false);
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
        setStatus('');
    };

    const saveDrawing = async () => {
        const canvas = canvasRef.current;
        const dataURL = canvas.toDataURL('image/png');

        try {
            setStatus('Сохраняем...');
            const response = await fetch('/api/drawings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: dataURL }),
            });
            const message = await response.text();

            if (!response.ok) {
                throw new Error(message || 'Не удалось сохранить рисунок');
            }

            setStatus(message || 'Рисунок сохранен');
        } catch (err) {
            console.error('Ошибка сохранения', err);
            setStatus('Ошибка сохранения рисунка');
        }
    };

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
                <button className="secondary-button" type="button" onClick={clearCanvas}>
                    Очистить
                </button>
                <button className="primary-button" type="button" onClick={saveDrawing}>
                    Сохранить рисунок
                </button>
            </div>

            <canvas
                ref={canvasRef}
                width={900}
                height={520}
                className="drawing-canvas"
                onPointerDown={startDrawing}
                onPointerMove={draw}
                onPointerUp={stopDrawing}
                onPointerCancel={stopDrawing}
                onPointerLeave={stopDrawing}
            />

            {status && <p className="status-line">{status}</p>}
        </div>
    );
}
