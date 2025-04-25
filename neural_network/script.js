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
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  
  tempCanvas.width = 28;
  tempCanvas.height = 28;
  
  tempCtx.drawImage(canvas, 0, 0, 28, 28);
  
  const imageData = tempCtx.getImageData(0, 0, 28, 28);
  const data = imageData.data;
  
  const pixelValues = [];
  for (let i = 0; i < data.length; i += 4) {
      const grayValue = data[i+3]
      pixelValues.push(grayValue);
  }
  
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