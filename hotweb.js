let starBtn = document.getElementById("starBtn");
let inputContainer = document.getElementById("starInput");

starBtn.addEventListener("click", function () {
    inputContainer.classList.toggle("hidden");
});