import { id } from "./script.js"

let navbar = id("navbar");
navbar.classList.add("navbar");

const pages = {"home": ["Home", "index.html"], "data_thresholding":["Data", "#"], "groups":["Characters", "#"], "map":["Campaigns", "#"], "school":["Learn", "#"], "rewarded_ads":["Awards", "#"]};

function createIcon(icon_name) {
    let icon = document.createElement("span")
    icon.classList.add("material-symbols-outlined")
    icon.textContent = icon_name
    return icon
}

Object.entries(pages).forEach(([icon, [name, url]]) => {
    let box = document.createElement("div");
    navbar.appendChild(box);
    box.appendChild(createIcon(icon))
    let littleBox = document.createElement("div");
    box.appendChild(littleBox)
    littleBox.textContent = name
    littleBox.style.left = "-" + littleBox.clientWidth + "px"
})