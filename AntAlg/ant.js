const can = document.getElementById("myCanvas");
const ctx = can.getContext("2d");
clBtn = document.querySelectorAll(".btn");
let points = [];

can.addEventListener("click", function(event) {
    const rect = can.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    points.push({ x: x, y: y });
    draw(x, y);
});

function draw(x, y) {
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
}
function clearW(){
    console.log("Очистка!");
    ctx.clearRect(0, 0, can.width, can.height);
    points = [];
}

function antAlg() {

}
clBtn[0].addEventListener("click", antAlg);
clBtn[1].addEventListener("click", clearW);