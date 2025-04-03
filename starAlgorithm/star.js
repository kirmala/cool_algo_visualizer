
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



    contain.innerHTML = "";

    contain.style.gridTemplateColumns = `repeat(${size}, 40px)`;
    contain.style.gridTemplateRows = `repeat(${size}, 40px)`;
    window.matrixStar = Array.from({length:size}, () => Array(size).fill(0));

    for (let i = 0; i < size; i++) {
        for(let j = 0; j < size; j++){
            let newDiv = document.createElement("div");
            newDiv.classList.add("btnTabForStar");
            newDiv.id = `divTableStar${i}${j}`;

            let blackDiv = Math.random();
            if(blackDiv <= 0.25){
                newDiv.style.backgroundColor = "purple";
                matrixStar[i][j] = 1;
            }
            else{
                newDiv.addEventListener("click",  () => {
                    newDiv.classList.toggle("clickedForStar");
                });
            }
            contain.appendChild(newDiv);
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

function outFromMatrix(point, size) {
    let x = point[0];
    let y = point[1];

    if (x < 0 || y < 0 || x >= size || y >= size) return false;
    if (window.matrixStar[x][y] === 1) return false;
    return true;
}

function AStar(){
    let size = document.getElementById("sizeTableForStar").value;
    let startEnd = [];
    for (let i = 0; i < size; i++) {
        for(let j = 0; j < size; j++){
            let div = document.getElementById(`divTableStar${i}${j}`);
            let color = window.getComputedStyle(div).backgroundColor;

            if (color === "rgb(255, 0, 0)") startEnd.push([i, j]);
        }
    }

    if (startEnd.length != 2) {
        alert("Поставь 2 точки!!!!");
        return;
    }

    let start = new Info(null,startEnd[0]);
    let end = new Info(null,startEnd[1]);

    let queue = [];
    let visited = [];
    queue.push(start);
    while(queue.length > 0){
        let current = queue[0];
        let index = 0;
        for(let i = 0; i < queue.length;i++){
            if(queue[i].sumWay < current.sumWay){
                current = queue[i];
                index = i;
            }
        }
        visited.push(current);
        queue.splice(index,1);

        if(current.position[0] === end.position[0] && current.position[1] === end.position[1]){
            let way = [];
            while (current.parent != null){
                way.push(current.position);
                current = current.parent;
            }
            way.push(current.position);
            way.reverse();
            wayCreate(way);
            return;
        }

        let neighbours = [
            new Info(current, [current.position[0] + 1,current.position[1]]),
            new Info(current, [current.position[0] - 1,current.position[1]]),
            new Info(current, [current.position[0],current.position[1] + 1]),
            new Info(current, [current.position[0],current.position[1] - 1]),
        ];
        let finalNeighb = [];

        for (move of neighbours){
            if (outFromMatrix(move.position, size, matrixStar))
                finalNeighb.push(move);
        }

        for (let neighbour of finalNeighb){
            if (visited.some(v => v.position[0] === neighbour.position[0] && v.position[1] === neighbour.position[1])) 
                continue;
            
            neighbour.startCur = current.startCur + 1;
            neighbour.evrCurEnd = checkEvr(neighbour,end);
            neighbour.sumWay = neighbour.startCur + neighbour.evrCurEnd;

            if(queue.some(q => q.position[0] === neighbour.position[0] && q.position[1] === neighbour.position[1] && neighbour.startCur > q.startCur))
                continue;

            queue.push(neighbour);
        }
    }
    alert("Нет пути между данными точками");
}

function wayCreate(way){
    for(let point of way){
        let edit = document.getElementById(`divTableStar${point[0]}${point[1]}`);
        if (edit) {
            edit.classList.add("wayPoint");
        }
    }
}
