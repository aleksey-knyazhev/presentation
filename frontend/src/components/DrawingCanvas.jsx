import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import useSlideEditor from '../hooks/useSlideEditor.js';
import DrawingToolbar from './DrawingToolbar.jsx';

const DrawingCanvas = forwardRef(function DrawingCanvas({ initialSlides, onSlideStateChange }, ref) {
    const canvasRef = useRef(null);
    const editor = useSlideEditor({ canvasRef, initialSlides, onSlideStateChange });

    useImperativeHandle(ref, () => ({
        addSlide: editor.addSlide,
        deleteSlide: editor.deleteSlide,
        downloadPresentation: editor.downloadPresentation,
        getSlides: editor.getSyncedSlides,
        previousSlide: editor.previousSlide,
        nextSlide: editor.nextSlide,
    }));

    return (
        <div className="drawing-panel">
            <DrawingToolbar
                canRedo={editor.canRedo}
                canUndo={editor.canUndo}
                lineWidth={editor.lineWidth}
                onClearCanvas={editor.resetCanvas}
                onLineWidthChange={editor.setLineWidth}
                onRedo={editor.redo}
                onStrokeColorChange={editor.setStrokeColor}
                onUndo={editor.undo}
                strokeColor={editor.strokeColor}
            />

            <canvas
                ref={canvasRef}
                width={900}
                height={267}
                className="drawing-canvas"
                onPointerDown={editor.startDrawing}
                onPointerMove={editor.draw}
                onPointerUp={editor.stopDrawing}
                onPointerCancel={editor.stopDrawing}
                onPointerLeave={editor.stopDrawing}
            />

            <div className="text-input-container">
                <label htmlFor="canvas-text">Текст на слайде:</label>
                <textarea
                    id="canvas-text"
                    rows="5"
                    placeholder="Введите text (поддерживает перенос строк с помощью Enter)..."
                    value={editor.text}
                    onChange={(e) => editor.setText(e.target.value)}
                />
            </div>

            {editor.status && <p className="status-line">{editor.status}</p>}
        </div>
    );
});

export default DrawingCanvas;
