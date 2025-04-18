function showAlert(text) {
    document.getElementById("alertText").innerText = text;
    document.getElementById("myAlert").classList.remove("hidden");
}

function closeAlert() {
    document.getElementById("myAlert").classList.add("hidden");
}

function generateTableForStar() {

    let size = parseInt(document.getElementById("sizeTableForStar").value);
    let contain = document.getElementById("tabForStar");

    if (!size || size <= 0) {
        showAlert("Введите корректное число!");
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
    window.matrixStar = Array.from({length:size}, () => Array(size).fill(1));

    for (let i = 0; i < size; i++) {
        for(let j = 0; j < size; j++){
            let newDiv = document.createElement("div");
            newDiv.classList.add("btnTabForStar");
            newDiv.classList.add("clickedPurple");
            newDiv.id = `divTableStar${i}_${j}`;
            contain.appendChild(newDiv);
        }
    }

    Primo(size);
}

function Primo(size) {
    function outFromMatrix(x, y) {
        if (x >= 0 && y >= 0 && x < size && y < size && window.matrixStar[x][y] === 1) return check.push({x, y});
    }

    function makeClear(x, y) {
        window.matrixStar[x][y] = 0;
        const div = document.getElementById(`divTableStar${x}_${y}`);
        if (div) div.classList.remove("clickedPurple");
    }


    let startX = Math.floor(Math.random() * (size / 2)) * 2 + 1;
    let startY = Math.floor(Math.random() * (size / 2)) * 2 + 1;
    makeClear(startX, startY);

    let check = [];
    outFromMatrix(startX + 2, startY);
    outFromMatrix(startX - 2, startY);
    outFromMatrix(startX, startY + 2);
    outFromMatrix(startX, startY - 2);

    let directions = [[2,0], [-2,0], [0,2], [0,-2]];
    while (check.length > 0) {
        const index = Math.floor(Math.random() * check.length);
        const { x, y } = check.splice(index, 1)[0];

        if(window.matrixStar[x][y] === 0) continue;
        makeClear(x, y);

        const neighbors = directions.map( direct => ({
            x2: x + direct[0],
            y2: y + direct[1],
            wallX: x + direct[0] / 2,
            wallY: y + direct[1] / 2
        })).filter(({ x2, y2 }) =>
            x2 >= 0 && x2 < size && y2 >= 0 && y2 < size && window.matrixStar[x2][y2] === 0
        );
        if (neighbors.length > 0) {
            const { wallX, wallY } = neighbors[Math.floor(Math.random() * neighbors.length)];
            makeClear(wallX, wallY);
        }
        outFromMatrix(x + 2, y);
        outFromMatrix(x - 2, y);
        outFromMatrix(x, y + 2);
        outFromMatrix(x, y - 2);
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

    if (x < 0 || y < 0 || x >= size || y >= size || matrixStar[x][y] === 1) return false;
    return true;
}

async function AStar(){
    let size = document.getElementById("sizeTableForStar").value;
    let startEnd = [...document.querySelectorAll(".clickedRed")].map(div => {
    let match = div.id.match(/\d+_\d+/g);
    return match ? match[0].split("_").map(Number) : null;
    }).filter(Boolean);

    if (startEnd.length !== 2) {
        showAlert("Поставьте 2 точки!!!!");
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

        let div = document.getElementById(`divTableStar${current.position[0]}_${current.position[1]}`);
        if (!div.classList.contains("clickedRed") && !div.classList.contains("wayPoint")) div.classList.add("checking");

        await new Promise(r => setTimeout(r, 30));

        if (current.position[0] === end.position[0] && current.position[1] === end.position[1]) {
            await wayCreate(current);
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
    showAlert("Нет пути!!!");
}

async function wayCreate(current){
    while (current.parent != null) {
        let edit = document.getElementById(`divTableStar${current.position[0]}_${current.position[1]}`);
        if (edit.classList.contains("checkingCell")) edit.classList.remove("checkingCell");
        edit.classList.add("wayPoint");
        current = current.parent;
        await new Promise(r => setTimeout(r, 30));
    }
    let edit = document.getElementById(`divTableStar${current.position[0]}_${current.position[1]}`);
    edit.classList.add("wayPoint");
}


function clearWay() {
    let elements = document.querySelectorAll(".wayPoint"); 
    elements.forEach(el => el.classList.remove("wayPoint"));
    elements = document.querySelectorAll(".clickedRed");
    elements.forEach(el => el.classList.remove("clickedRed"));
    elements = document.querySelectorAll(".checking");
    elements.forEach(el => el.classList.remove("checking"));
}
