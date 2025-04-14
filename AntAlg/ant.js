const can = document.getElementById("myCanvas");
const ctx = can.getContext("2d");
let clBtn = document.querySelectorAll(".btn");
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

function launch() {

}
clBtn[0].addEventListener("click", launch);
clBtn[1].addEventListener("click", clearW);

class antPath {
    constructor() {
        this.peakAnt = [];
        this.distance = 0;
    }
}

class Ant{
    constructor(st =0) {
        this.startP = st;
        this.path = new antPath();
        this.curP = st;
        this.contin = true;
        this.visited = [];
    }
    rand() {
        return Math.random();
    }
    getNeigh(list){
        return list[this.curP];
    }
    choice(list, p, a, b){
        const neighbours = this.getNeigh();
        const wishList = [];
        let sum =0;
        for(let neigh of neighbours){
            if (!this.visited.includes(neigh)) {
                const levelP = p[this.curP][neigh];
                const evr = 1/list[this.curP][neigh];
                let val = Math.pow(levelP, a) * Math.pow(evr, b);
                wishList.push([neigh, val]);
                sum += val;
            }
        }
        if(wishList.length === 0){
            this.contin = false;
            return;
        }
        for(let prob of wishList) prob[1] /=sum;

        let s = 0;
        const ran = this.rand();
        for(let prob of wishList){
            s += prob[1];
            if (ran <= s){
                this.curP = prob[0];
                this.visited.push(prob[0]);
                this.path.peakAnt.push(prob[0]);
                this.path.distance += list[this.path.peakAnt[this.path.peakAnt.length - 2]][prob[0]];
                return;
            }
        }
    }
}

class AntsAlgo{

}
