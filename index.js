import {id} from "./script.js"

let lastChar = id("lastChar")
let lastSpell = id("lastSpell")

if (sessionStorage.get("lastChar")) {
    lastChar.createElement("p").textContent = sessionStorage.get("lastChar")
} else {
    lastChar.style.opacity = "30%"
}

if (sessionStorage.get("lastSpell")) {
    lastSpell.createElement("p").textContent = sessionStorage.get("lastSpell")
    lastSpell.addEventListener("click", function() {
        window.location.search = "?spell=" + sessionStorage.get("lastSpell")
        window.location.pathname = "/Dungeons-and-Dashboard/spells/spells.html"
    })
} else {
    lastSpell.style.opacity = "30%"
}
