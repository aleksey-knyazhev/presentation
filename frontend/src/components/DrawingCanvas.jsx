import React, { useRef, useState } from 'react';

export default function DrawingCanvas() {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [strokeColor, setStrokeColor] = useState('#1f2937');
    const [lineWidth, setLineWidth] = useState(4);
    const [status, setStatus] = useState('');

    // Состояние для многострочного текста
    const [text, setText] = useState('');
    const [textX] = useState(50);
    const [textY] = useState(50);

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
        setText('');
        setStatus('');
    };

    const saveDrawing = async () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Логика переноса многострочного текста на холст
        if (text.trim() !== '') {
            ctx.font = '24px Arial';
            ctx.fillStyle = strokeColor;

            const lines = text.split('\n'); // Разбиваем по переносу строки
            const lineHeight = 30; // Межстрочный интервал в пикселях

            lines.forEach((line, index) => {
                ctx.fillText(line, textX, textY + (index * lineHeight));
            });
        }

        const dataURL = canvas.toDataURL('image/png');

        try {
            setStatus('Сохраняем...');
            const response = await fetch('/api/drawings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image: dataURL,
                    text: text
                }),
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
        <div className="drawing-panel" style={{ display: 'inline-block' }}>
            {/* Upper toolbar controls */}
            <div className="toolbar" aria-label="Настройки кисти" style={{ marginBottom: '10px', display: 'flex', gap: '15px', alignItems: 'center', width: '900px', boxSizing: 'border-box' }}>
                <label className="control" style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                    Цвет
                    <input
                        type="color"
                        value={strokeColor}
                        onChange={(e) => setStrokeColor(e.target.value)}
                    />
                </label>
                <label className="control range-control" style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
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

            {/* Canvas Area */}
            <canvas
                ref={canvasRef}
                width={900}
                height={347}
                className="drawing-canvas"
                onPointerDown={startDrawing}
                onPointerMove={draw}
                onPointerUp={stopDrawing}
                onPointerCancel={stopDrawing}
                onPointerLeave={stopDrawing}
                style={{ display: 'block', backgroundColor: '#ffffff', width: '900px', border: '1px solid #ccc' }}
            />

            {/* Многострочное текстовое поле ровно по ширине холста */}
            <div className="text-input-container" style={{ marginTop: '15px', width: '900px', display: 'flex', flexDirection: 'column', gap: '5px', textAlign: 'left', boxSizing: 'border-box' }}>
                <label htmlFor="canvas-text" style={{ fontWeight: '500', fontSize: '14px', color: '#374151' }}>Надпись на рисунке:</label>
                <textarea
                    id="canvas-text"
                    rows="5" // Задает фиксированную высоту в 5 строк
                    placeholder="Введите текст (поддерживает перенос строк с помощью Enter)..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    style={{
                        padding: '10px 12px',
                        width: '100%',
                        boxSizing: 'border-box',
                        borderRadius: '6px',
                        border: '1px solid #d1d5db',
                        fontSize: '15px',
                        fontFamily: 'Arial, sans-serif',
                        resize: 'vertical' // Позволяет менять высоту вручную только по вертикали
                    }}
                />
            </div>

            {status && <p className="status-line" style={{ width: '900px', textAlign: 'left', marginTop: '8px' }}>{status}</p>}
        </div>
    );
}
