const canvas = document.getElementById('drawingCanvas');
const context = canvas.getContext('2d');
const submitButton = document.getElementById('submitButton');
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

submitButton.addEventListener('click', () => {
  const imageData = canvas.toDataURL('image/png');
  console.log('Отправка данных: ', imageData);

  const randomNumber = Math.floor(Math.random() * 10);
  resultText.textContent = randomNumber;
});