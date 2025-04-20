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


async function launch() {
    const countPop = 1000;
    const iter = 500;
    const mutationChance = 0.1;
    let matrix = build(points);
    let population = initial(matrix,countPop);

    for (let i = 0; i < countPop; i++) {
        population[i] = [dist(matrix, population[i]), population[i]];
    }
    population.sort((a, b) => a[0] - b[0]);

    for (let i = 0; i < iter; i++) {
        let ind1 = Math.floor(Math.random() * population.length);
        let ind2 = Math.floor(Math.random() * population.length);
        while (ind2 === ind1) ind2 = Math.floor(Math.random() * population.length);
        const gen1 = population[ind1][1];
        const gen2 = population[ind2][1];

        let child1 = crossing(gen1, gen2);
        let child2 = crossing(gen2, gen1);
        child1 = mutation(child1, mutationChance);
        child2 = mutation(child2, mutationChance);
        let dist1 = dist(matrix, child1);
        let dist2 = dist(matrix, child2);

        population.push([dist1, child1]);
        population.push([dist2, child2]);

        population.sort((a, b) => a[0] - b[0]);
        population = population.slice(0, countPop);


        let bestW = population[0][0];
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
        await Promise
    }

}

function crossing(gen1, gen2) {
    let cut = Math.floor((gen1.length - 2) / 2);
    let beforeCut = gen1.slice(1, cut + 1);
    let afterCut = gen2.slice(cut + 1, gen2.length - 2);
    let check = new Set();

    for(let i = 0; i < afterCut.length; i++)
        if (!beforeCut.includes(afterCut[i])) check.add(afterCut[i]);

    if (check.length !== gen1.length - 2) {
        for (let i = 0; i < gen2.length; i++)
            if (!check.has(gen2[i]) && gen2[i] !== 0) check.add(gen2[i]);
    }

    let result = [0, ...beforeCut, ...Array.from(check), 0];
    return result;
}

function mutation(child, mutationChance){
    let chance = Math.random();
    if (chance > mutationChance) return child;

    let mut = child.slice();
    let ind1 = Math.floor(Math.random() * (mut.length - 2)) + 1;
    let ind2 = Math.floor(Math.random() * (mut.length - 2)) + 1;
    while (ind2 === ind1) ind2 = Math.floor(Math.random() * (mut.length - 2)) + 1;

    [mut[ind1], mut[ind2]] = [mut[ind2], mut[ind1]];
    return mut;
}

function initial(matrix, countPop) {
    let pop = [];
    const countPeak = [...Array(matrix.length).keys()];

    for (let i = 0; i < countPop; i++) {
        let way = [0];
        let without0 = countPeak.slice(1);
        way.push(...mix(without0));
        way.push(0);
        pop.push(way);
    }
    return pop;
}

function mix(arr){
    for (let i = arr.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function dist(matrix, gen) {
    let dist = 0;
    for (let i = 0; i < gen.length - 1; i++)
        dist += matrix[gen[i]][gen[i + 1]];
    return dist;
}

function build(points){
    const matrix = Array.from({length: points.length}, () => Array(points.length).fill(0));
    for (let i = 0; i < points.length; i++) {
        for (let j =  i + 1; j < points.length; j++) {
            const dist = Math.sqrt(Math.pow(points[i].x - points[j].x, 2) + Math.pow(points[i].y - points[j].y, 2));
            matrix[i][j] = dist;
            matrix[j][i] = dist;
        }
    }
    return matrix;
}