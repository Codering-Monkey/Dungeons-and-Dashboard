import { id } from "./script.js"

let navbar = id("navbar");
navbar.classList.add("navbar");

const pages = {"home": ["Home", "index.html"], "groups":["Characters", "all_characters.html"], "wand_shine":["Spells", "Spells/spells.html"]};

function createIcon(icon_name) {
    let icon = document.createElement("span")
    icon.classList.add("material-symbols-outlined")
    icon.textContent = icon_name
    return icon
}

Object.entries(pages).forEach(([icon, [name, url]]) => {
    let box = document.createElement("div");
    box.addEventListener("click", function() {
        document.location.pathname = "/" + document.location.pathname.split("/")[1] + "/" + url
    })
    navbar.appendChild(box);
    box.appendChild(createIcon(icon))
    let littleBox = document.createElement("div");
    box.appendChild(littleBox)
    littleBox.textContent = name
    littleBox.style.left = "-" + littleBox.clientWidth + "px"
})