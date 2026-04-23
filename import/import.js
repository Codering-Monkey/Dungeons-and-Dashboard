import { id } from "/script.js"

let bar = id("bar")
let input = id("dataInput")
for (let i = 0; i < bar.children.length; i++) {
    bar.children[i].addEventListener("click", function () {
        for (let k = 0; k < bar.children.length; k++) {
            bar.children[k].setAttribute("active", "false")
        }
        this.setAttribute("active", "true")
        input.clear()
        if (this.textContent === "ink_pen") {
            input.appendChild(document.createElement("textarea"))
        }
    })
}

