import { id, spacer } from "./script.js"

console.log("navbar.js")

let navbar = id("navbar");

const pages = {
    "home": ["Home", "index.html"],
    "person": ["Characters", "#"]
}

navbar.classList.add("navbar")

function createNavElement(icon, name) {
    let container = document.createElement("div");
    navbar.appendChild(container);

    let symbol = document.createElement("span");
    symbol.classList.add("material-symbols-outlined");
    symbol.textContent = icon;
    container.appendChild(symbol);

    let message = document.createElement("p");
    message.textContent = name;
    container.appendChild(message);

    return container
}

let menu = createNavElement("menu", "Close")
menu.addEventListener("click", function () {
    if (menu.firstChild.textContent === "menu") {
        menu.firstChild.textContent = "close"
        navbar.style.width = "20rem";
    } else {
        menu.firstChild.textContent = "menu"
        navbar.style.width = "3rem";
    }
})

createNavElement("settings", "Settings").addEventListener("click",
        function () {window.location.href = "settings.html"})

spacer(navbar)

Object.entries(pages).forEach(([icon, name]) => {
    createNavElement(icon, name[0]).addEventListener("click",
        function () {window.location.href = name[1]})
})
