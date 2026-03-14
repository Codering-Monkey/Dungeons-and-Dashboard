import { id } from "./script.js"
import { hoverBackground, hoverShadow } from "./css.js";
import { loadColours } from "./colour_scheme.js";
import accentColours from "./accents.json" with {type: "json"}

let system = id("system")
    if (window.matchMedia('(prefers-color-scheme: light)').matches) {
        system.setAttribute("colour_scheme", "light")
    } else {
        system.setAttribute("colour_scheme", "dark")
    }

let current = id(localStorage.get("colourScheme"))
current.style.boxShadow = ".25rem .25rem var(--foreground)"

let rawPrimary = localStorage.get("primary")
let rawSecondary = localStorage.get("secondary")

const schemeOptions = ["light", "system", "dark"]
for (let i = 0; i < schemeOptions.length; i++) {
    let container = id(schemeOptions[i])
    container.style.border = "1px solid black"
    container.style.backgroundColor = "var(--background)";

    let littleNotNav = document.createElement("div")
    littleNotNav.style.width = "85%"
    littleNotNav.style.float = "right"
    container.appendChild(littleNotNav)

    let littleHeader = document.createElement("h3")
    littleHeader.textContent = schemeOptions[i].capitalise()
    littleNotNav.appendChild(littleHeader)

    let newPrimary
    let newSecondary
    if (container.getAttribute("colour_scheme") === "light") {
        newPrimary = "color-mix(in srgb, " + rawPrimary + ", black)"
        newSecondary = "color-mix(in srgb, " + rawSecondary + ", black)"
    } else {
        newPrimary = "color-mix(in srgb, " + rawPrimary + ", white)"
        newSecondary = "color-mix(in srgb, " + rawSecondary + ", white)"
    }

    let littlePrimary = document.createElement("h4")
    littlePrimary.textContent = "Primary"
    littlePrimary.style.color = newPrimary;
    littleNotNav.appendChild(littlePrimary)

    let littleSecondary = document.createElement("h4")
    littleSecondary.textContent = "Secondary"
    littleSecondary.style.color = newSecondary;
    littleNotNav.appendChild(littleSecondary)

    let littleNav = document.createElement("div");
    littleNav.style.width = "10%"
    littleNav.style.height = "100%"
    littleNav.style.float = "left"
    littleNav.style.backgroundColor = "var(--foreground)"
    container.appendChild(littleNav)

    hoverShadow(container, "var(--primary)", .25, .25, "rem")

    container.addEventListener("click", function () {
        for (let k = 0; k < schemeOptions.length; k++) {
            id(schemeOptions[k]).style.boxShadow = "none";
            container.style.boxShadow = ".25rem .25rem var(--foreground)"
            localStorage.set("colourScheme", schemeOptions[i])
            loadColours()
        }
    })
}

let primarySelect = id("primarySelect")
primarySelect.clear()
let secondarySelect = id("secondarySelect")
secondarySelect.clear()
Object.entries(accentColours).forEach(([name, colour]) => {
    let container = document.createElement("div")
    container.style = "--square-colour: "+ colour

    let square = document.createElement("div")
    square.classList.add("colour-square")
    container.appendChild(square)

    let text = document.createElement("p")
    text.textContent = name
    container.appendChild(text)

    let clone = container.cloneNode(true)
    container.id = colour + "Primary"
    container.addEventListener("click", function () {changeColour(primarySelect, container, "primary")})
    primarySelect.appendChild(container)
    clone.id = colour + "Secondary"
    clone.addEventListener("click", function () {changeColour(secondarySelect, clone, "secondary")})

    secondarySelect.appendChild(clone)
})

let primary = localStorage.get("primary")
let secondary = localStorage.get("secondary")

id(primary + "Primary").style.backgroundColor = "var(--foreground)"
id(secondary + "Secondary").style.backgroundColor = "var(--foreground)"

function changeColour(container, selected, catagory) {
    localStorage.set(catagory, selected.id.slice(0, 7));
    let children = container.children
    for (let i = 0; i < children.length; i++) {
        children[i].style.backgroundColor = ""
    }
    selected.style.backgroundColor = "var(--foreground)"
    loadColours()
}