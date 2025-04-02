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


function AStar(){
    let table = document.getElementById("tabForStar");

}