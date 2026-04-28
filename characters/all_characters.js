import { id } from "../script.js"

let charactersJSON = localStorage.get("Characters")
if (!charactersJSON) {
    charactersJSON = []
    localStorage.set("Characters", charactersJSON)
}

let grid = id("grid")
for (let char of charactersJSON) {
    let tile = document.createElement("div")
    tile.classList.add("characters-grid-char")
    grid.appendChild(tile)
}
let tile = document.createElement("div")
tile.classList.add("characters-grid-other")
grid.appendChild(tile)

let subTile = document.createElement("div")
subTile.textContent = "Create New Character"
tile.appendChild(subTile)
subTile = document.createElement("div")
subTile.textContent = "Create From Preset"
tile.appendChild(subTile)