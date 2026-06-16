const menuBtn = document.getElementById("menu-btn");
const sidebar = document.getElementById("sidebar");
const closeBtn = document.getElementById("close-btn")

menuBtn.addEventListener("click", () => {
    sidebar.classList.toggle("aberta");
})

closeBtn.addEventListener("click", () => {
    sidebar.classList.toggle("aberta");
})