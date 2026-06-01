import {id} from "./script.js"

let lastChar = id("lastChar")
let lastSpell = id("lastSpell")

if (localStorage.get("lastChar")) {
    lastChar.createElement("p").textContent = localStorage.get("Characters")[localStorage.get("lastChar")]["Name"]
    lastChar.addEventListener("click", function() {
        window.location.search = "Char=" + localStorage.get("lastChar")
        window.location.pathname = "/Dungeons-and-Dashboard/characters/player.html"
    })
} else {
    lastChar.style.opacity = "30%"
}

if (localStorage.get("lastSpell")) {
    lastSpell.createElement("p").textContent = localStorage.get("lastSpell")
    lastSpell.addEventListener("click", function() {
        window.location.search = "?spell=" + localStorage.get("lastSpell")
        window.location.pathname = "/Dungeons-and-Dashboard/spells/spells.html"
    })
} else {
    lastSpell.style.opacity = "30%"
}
