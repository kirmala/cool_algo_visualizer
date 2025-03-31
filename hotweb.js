let starBtn = document.getElementById("starBtn");
let inputContainer = document.getElementById("starInput");

starBtn.addEventListener("click", function () {
    inputContainer.classList.toggle("hidden");
});

function table(){
    let size = document.getElementById("sizeTable").value;
    let cont = document.getElementById("tab");

    if (!size) alert("Введите число дебилы!!");

    cont.innerHTML = "";
    cont.style.gridTemplateColumns = `repeat(${size}, 40px)`;
    cont.style.gridTemplateRows = `repeat(${size}, 40px)`;



    for(let i = 0; i < size * size; i++){
        let addDiv = document.createElement("div");
        addDiv.classList.add("btnTab");

    }

}
