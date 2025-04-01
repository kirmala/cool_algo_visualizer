let starBtn = document.getElementById("starBtn");
let inputContainer = document.getElementById("starInput");

starBtn.addEventListener("click", function () {
    inputContainer.classList.toggle("hidden");
});

let tableForStar = document.getElementById("tabForStar");
let createButtonForTableStar = document.getElementById("createButForStar");


createButtonForTableStar.addEventListener("click", function () {
    tableForStar.classList.remove("hiddenTable");
});

function generateTableForStar() {
    let size = document.getElementById("sizeTableForStar").value;
    let contain = document.getElementById("tabForStar");

    
    if (!size || size <= 0) {
        alert("Введите корректное число!");
        return;
    }
    let createButtonforWayStar = document.getElementById("createWayForStar");
    createButtonforWayStar.classList.remove("hiddenTable");



    contain.innerHTML = "";

    contain.style.gridTemplateColumns = `repeat(${size}, 40px)`;
    contain.style.gridTemplateRows = `repeat(${size}, 40px)`;

    for (let i = 0; i < size * size; i++) {
        let cell = document.createElement("div");
        cell.classList.add("btnTabForStar");

        
        cell.addEventListener("click",  () => {
            cell.classList.toggle("clickedForStar");
        });

        contain.appendChild(cell);
    }
}
