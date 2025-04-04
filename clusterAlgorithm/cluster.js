let canv = document.getElementById("canvas");
let ctx = canv.getContext("2d");
canv.width = 500;
canv.height = 500;

canv.addEventListener("mousedown", function (e) {
    let rect = canv.getBoundingClientRect();
    let xPos = e.clientX - rect.left;
    let yPos = e.clientY - rect.top;
    ctx.fillStyle = blue;
    ctx.beginPath();
    ctx.arc(xPos, yPos, 10, 0, Math.PI * 2);
    ctx.fill();
});
