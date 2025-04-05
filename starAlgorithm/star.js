
function generateTableForStar() {
    let size = document.getElementById("sizeTableForStar").value;
    let contain = document.getElementById("tabForStar");

    if (!size || size <= 0) {
        alert("Введите корректное число!");
        return;
    }
    contain.classList.remove("hiddenTable");

    let createButtonforWayStar = document.getElementById("createWayForStar");
    createButtonforWayStar.classList.remove("hiddenTable");

    let textStarsWithTable = document.getElementById("textStarsWithTable");
    textStarsWithTable.classList.remove("hiddenTable");

    let cleanBut = document.getElementById("cleanButton");
    cleanBut.classList.remove("hiddenTable");

    let Rd = document.getElementById("RdButton");
    Rd.classList.remove("hiddenTable");

    let Pr = document.getElementById("PrButton");
    Pr.classList.remove("hiddenTable");


    contain.innerHTML = "";
    contain.style.gridTemplateColumns = `repeat(${size}, 40px)`;
    contain.style.gridTemplateRows = `repeat(${size}, 40px)`;
    window.matrixStar = Array.from({length:size}, () => Array(size).fill(0));

    for (let i = 0; i < size; i++) {
        for(let j = 0; j < size; j++){
            let newDiv = document.createElement("div");
            newDiv.classList.add("btnTabForStar");
            newDiv.id = `divTableStar${i}_${j}`;
            contain.appendChild(newDiv);
        }
    }
}


function checkState(currentMode){
    document.querySelectorAll(".btnTabForStar").forEach(elem => {
        elem.addEventListener("click",universalStep);
    });
    window.mode = currentMode;
}

function universalStep(e) {
    const elem = e.currentTarget;


    if (mode === "block") {
        if (!elem.classList.contains("clickedRed")) {
            elem.classList.toggle("clickedPurple");
            let point= elem.id.match(/\d+_\d+/)[0].split("_").map(Number);
            let x = point[0];
            let y = point[1];
            matrixStar[x][y] = elem.classList.contains("clickedPurple") ? 1 : 0;
        }
    }
    else if (mode === "red") {
        if (!elem.classList.contains("clickedPurple")) {
            elem.classList.toggle("clickedRed");
        }
    }
}



class Info{
    constructor(parent = null,position=null){
        this.parent = parent;
        this.position = position;
        this.startCur = 0;
        this.evrCurEnd = 0;
        this.sumWay = 0;
    }
}

function checkEvr(but1,but2){
    return Math.abs(but1.position[0] - but2.position[0]) + Math.abs(but1.position[1] - but2.position[1]);
}

function outFromMatrix(point, size, matrixStar) {
    let x = point[0];
    let y = point[1];

    if (x < 0 || y < 0 || x >= size || y >= size) return false;
    if (matrixStar[x][y] === 1) return false;
    return true;
}

function AStar(){
    let size = document.getElementById("sizeTableForStar").value;
    let startEnd = [...document.querySelectorAll(".clickedRed")].map(div => {
    let match = div.id.match(/\d+_\d+/g);
    return match ? match[0].split("_").map(Number) : null;
    }).filter(Boolean);

    if (startEnd.length != 2) {
        alert("Поставьте 2 точки!!!!");
        return;
    }

    let start = new Info(null,startEnd[0]);
    let end = new Info(null,startEnd[1]);

    let visitedSet = new Set();
    let queue = [start];
    let queueMap = new Map();
    const keyStart = `${start.position[0]}_${start.position[1]}`;
    queueMap.set(keyStart, start);

    while (queue.length > 0) {
        queue.sort((a, b) => a.sumWay - b.sumWay);
        let current = queue.shift();
        let keyCurrent = `${current.position[0]}_${current.position[1]}`;
        queueMap.delete(keyCurrent);
        visitedSet.add(keyCurrent);

        if (current.position[0] === end.position[0] && current.position[1] === end.position[1]) {
            wayCreate(current);
            return;
        }

        let directions = [[1,0], [-1,0], [0,1], [0,-1]];
        for (let [dx, dy] of directions) {
            let nx = current.position[0] + dx;
            let ny = current.position[1] + dy;
            let posit = [nx, ny];

            if (!outFromMatrix(posit, size, matrixStar)) continue;

            let keyN = `${nx}_${ny}`;
            if (visitedSet.has(keyN)) continue;

            let neighbour = new Info(current, posit);
            neighbour.startCur = current.startCur + 1;
            neighbour.evrCurEnd = checkEvr(neighbour, end);
            neighbour.sumWay = neighbour.startCur + neighbour.evrCurEnd;

            if (!queueMap.has(keyN) || queueMap.get(keyN).startCur > neighbour.startCur) {
                queue.push(neighbour);
                queueMap.set(keyN, neighbour);
            }
        }
    }
    alert("Нет пути!!!");
}

function wayCreate(current){
    while (current.parent != null) {
        let edit = document.getElementById(`divTableStar${current.position[0]}_${current.position[1]}`);
        edit.classList.add("wayPoint");
        current = current.parent;
    }
    let edit = document.getElementById(`divTableStar${current.position[0]}_${current.position[1]}`);
    edit.classList.add("wayPoint");
}


function clearWay() {
    let elements = document.querySelectorAll(".wayPoint"); 
    elements.forEach(el => el.classList.remove("wayPoint"));
    elements = document.querySelectorAll(".clickedRed");
    elements.forEach(el => el.classList.remove("clickedRed"));
}