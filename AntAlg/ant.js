const can = document.getElementById("myCanvas");
const ctx = can.getContext("2d");
let clBtn = document.querySelectorAll(".btn");
let points = [];


function showAlert(text) {
    document.getElementById("alertText").innerText = text;
    document.getElementById("myAlert").classList.remove("hidden");
}

function closeAlert() {
    document.getElementById("myAlert").classList.add("hidden");
}


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
    ctx.clearRect(0, 0, can.width, can.height);
    points = [];
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
    constructor(st = 0) {
        this.startPeak = st;
        this.path = new antPath();
        this.curPeak = st;
        this.contin = true;
        this.visited = [];
    }
    rand() {
        return Math.random();
    }
    getNeigh(list) {
        const res = [];
        for (let i = 0; i < list.length; i++) {
            if (i !== this.curPeak) res.push(i);
        }
        return res;
    }

    choice(list, phList, a, b){
        const neighbours = this.getNeigh(list);
        const wishList = [];
        let sum = 0.0;
        for(let neigh of neighbours){
            if (!this.visited.includes(neigh)) {
                const levelP = phList[this.curPeak][neigh];
                const evr = 1/list[this.curPeak][neigh];
                let val = Math.pow(levelP, a) * Math.pow(evr, b);
                wishList.push([neigh, val]);
                sum += val;
            }
        }
        if(wishList.length === 0){
            this.contin = false;
            this.path.peakAnt.push(this.startPeak);
            this.path.distance += list[this.path.peakAnt[this.path.peakAnt.length - 1]][this.startPeak];
            return;
        }
        for(let prob of wishList) prob[1] = prob[1] / sum;

        let s = 0;
        const ran = this.rand();
        for(let prob of wishList){
            s += prob[1];
            if (ran <= s){
                this.curPeak = prob[0];
                this.visited.push(prob[0]);
                this.path.peakAnt.push(prob[0]);
                this.path.distance += list[this.path.peakAnt[this.path.peakAnt.length - 2]][prob[0]];
                return;
            }
        }
    }
}

class AntsAlgo{
    constructor(matrix) {
        this.a = 1.0;
        this.b = 2.0;
        this.matrix = matrix;
        this.ph = 1;
        this.Q = 100.0;
        this.delPh = 0.2;

        this.size = matrix.length;
        this.phList = Array.from({length:this.size}, () => Array(this.size).fill(this.ph));
        this.ants = [];
    }

    creatAnts(count){
        this.ants = [];
        for(let i = 0; i < count; i++){
            const ant = new Ant(i % this.matrix.length);
            ant.visited.push(ant.startPeak);
            ant.path.peakAnt.push(ant.startPeak);
            this.ants.push(ant);
        }
    }

    upgradeP(){
        for(let i = 0; i < this.size; i++){
            for(let j = 0; j < this.size; j++) this.phList[i][j] *= (1 - this.delPh);
        }

        for(const ant of this.ants){
            const peaks = ant.path.peakAnt;
            const dist = ant.path.distance;
            for(let i = 0; i < peaks.length - 1; i++){
                const delta = this.Q / dist;
                this.phList[peaks[i]][peaks[i + 1]] += delta;
                this.phList[peaks[i + 1]][peaks[i]] += delta;
            }
        }
    }

    StartAlg(iter = 10, antCount = 10){
        let bestW = null;
        for(let i = 0; i < iter; i++){
            this.creatAnts(antCount);
            for(let ant of this.ants){
                while (ant.contin)
                    ant.choice(this.matrix, this.phList, this.a, this.b);

                if (!bestW || ant.path.distance < bestW.distance) {
                    bestW = JSON.parse(JSON.stringify(ant.path));
                }
            }
            this.upgradeP();
        }
        return bestW;
    }
}

function launch() {
    let countIt = document.getElementById("iter").value;
    let countAnts = document.getElementById("countAnts").value;

    if (!countIt || !countAnts || countIt > 100 || countAnts > 100 || countIt <= 0 || countAnts <= 0) {
        showAlert("Введите корректные значения: итераций ≤ 100, муравьев ≤ 100");
        return;
    }

    const matrix = build(points);
    const alg = new AntsAlgo(matrix);

    if (parseInt(countAnts) < points.length) countAnts = points.length;
    let bestW = alg.StartAlg(parseInt(countIt),parseInt(countAnts));

    ctx.clearRect(0,0, can.width, can.height);
    for(let point of points) draw(point.x, point.y);

    ctx.strokeStyle = "purple";
    ctx.lineWidth = 3;

    ctx.beginPath();
    const startPeak = points[bestW.peakAnt[0]];
    ctx.moveTo(startPeak.x, startPeak.y);
    for (let i = 1; i < bestW.peakAnt.length; i++){
        let peak = points[bestW.peakAnt[i]];
        ctx.lineTo(peak.x, peak.y);
    }
    ctx.stroke();
    ctx.closePath();
}

function build(points) {
    const countPoints = points.length;
    const matrix = Array.from({length: countPoints}, () => Array(countPoints).fill(0));
    for (let i = 0; i < countPoints; i++) {
        for (let j =  i + 1; j < countPoints; j++) {
            const dist = Math.sqrt(Math.pow(points[i].x - points[j].x, 2) + Math.pow(points[i].y - points[j].y, 2));
            matrix[i][j] = dist;
            matrix[j][i] = dist;
        }
    }
    return matrix;
}
