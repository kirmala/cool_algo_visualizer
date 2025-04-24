const canvas = document.getElementById('drawingCanvas');
const context = canvas.getContext('2d');
const resultText = document.getElementById('resultNumber');

let drawing = false;

const scaleX = canvas.offsetWidth / canvas.width;
const scaleY = canvas.offsetHeight / canvas.height;

canvas.addEventListener('mousedown', (e) => {
  drawing = true;
  context.beginPath();
  context.moveTo((e.offsetX) / scaleX, (e.offsetY) / scaleY);
});

canvas.addEventListener('mousemove', (e) => {
  if (drawing) {
    context.lineTo((e.offsetX) / scaleX, (e.offsetY) / scaleY);
    context.stroke();
  }
});

canvas.addEventListener('mouseup', () => {
  drawing = false;
});

canvas.addEventListener('mouseleave', () => {
  drawing = false;
});

function prepareCanvasData(canvas) {
  // Create a temporary canvas to resize and process the image
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  
  // Resize to 28x28 (MNIST standard size)
  tempCanvas.width = 28;
  tempCanvas.height = 28;
  
  // Draw original canvas content resized to 28x28
  tempCtx.drawImage(canvas, 0, 0, 28, 28);
  
  // Get image data (RGBA format)
  const imageData = tempCtx.getImageData(0, 0, 28, 28);
  const data = imageData.data;
  
  // Convert to grayscale and extract pixel values (0-255)
  const pixelValues = [];
  for (let i = 0; i < data.length; i += 4) {
      // Simple grayscale conversion (average of RGB channels)
      const grayValue = data[i+3]
      // Invert if needed (MNIST has white digits on black background)
      const inverted = 255 - grayValue;
      pixelValues.push(grayValue);
  }
  
  // Convert to Uint8Array
  
  return pixelValues;
}



document.getElementById('submitButton').addEventListener('click', function() {
  const imageData = prepareCanvasData(canvas);

  console.log('Отправка данных: ', imageData);

  fetch('http://localhost:8080/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ image: imageData })
  })
  .then(response => response.json())
  .then(data => {
    console.log('Ответ от сервера:', data);
    resultText.textContent = data.result;
  })
  .catch(error => {
    console.error('Ошибка:', error);
  });
});

document.getElementById('clearButton').addEventListener('click', function() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  resultText.textContent = '?';
});