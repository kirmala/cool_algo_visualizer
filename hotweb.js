let starBtn = document.getElementById("starBtn");
let inputContainer = document.getElementById("starInput");

starBtn.addEventListener("click", function () {
    inputContainer.classList.toggle("hidden");
});
let table = document.getElementById("tab");
table.addEventListener("click", function () {
    inputContainer.classList.remove("hiddenTable");
});

function generateTable() {
    let size = document.getElementById("sizeTable").value;
    let container = document.getElementById("tab");

    // Проверяем, ввёл ли пользователь число
    if (!size || size <= 0) {
        alert("Введите корректное число!");
        return;
    }

    // Очищаем старую таблицу
    container.innerHTML = "";

    // Настраиваем grid
    container.style.gridTemplateColumns = `repeat(${size}, 40px)`;
    container.style.gridTemplateRows = `repeat(${size}, 40px)`;

    for (let i = 0; i < size * size; i++) {
        let cell = document.createElement("div");
        cell.classList.add("cell");

        // Добавляем обработчик клика для смены цвета
        cell.addEventListener("click",  () => {
            cell.classList.toggle("clicked");
        });

        container.appendChild(cell);
    }
}
