export const clearCanvas = (canvas) => {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};

export const drawImageOnCanvas = (canvas, imageDataUrl) => {
  clearCanvas(canvas);

  if (!imageDataUrl) {
    return;
  }

  const ctx = canvas.getContext('2d');
  const img = new Image();
  img.src = imageDataUrl;
  img.onload = () => {
    clearCanvas(canvas);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  };
};

export const getCanvasPoint = (canvas, event) => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
};

export const restoreCanvasSnapshot = (canvas, snapshot) => {
  clearCanvas(canvas);

  if (!snapshot) {
    return;
  }

  const ctx = canvas.getContext('2d');
  const img = new Image();
  img.src = snapshot;
  img.onload = () => {
    clearCanvas(canvas);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  };
};
