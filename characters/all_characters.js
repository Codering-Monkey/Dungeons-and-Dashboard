import {id, numSuffix} from "../script.js"
import subclasses from "../Data/subclasses.json" with {type: "json"};

let charactersJSON = localStorage.get("Characters")
if (!charactersJSON) {
    charactersJSON = []
    localStorage.set("Characters", charactersJSON)
}

let grid = id("grid")
for (let i = 0; i < charactersJSON.length; i++) {
    let charData = charactersJSON[i]
    let tile = grid.createElement("div")
    tile.classList.add("characters-grid-char")

    tile.createElement("img").src = (charData["Pfp"] || "../Images/players/blank.png")
    tile.createElement("h3").textContent = charData["Name"]
    tile.break()
    if (charData["Level"] < 3) {
        tile.createElement("p").textContent = `${numSuffix(charData["Level"])} level ${charData["Species"]} ${charData["Class"]}`
    } else {
       tile.createElement("p").textContent = `${numSuffix(charData["Level"])} level ${charData["Species"]} ${(subclasses[charData["Class"]][charData["Subclass"]]["Prefix"] || charData["Subclass"])} ${charData["Class"]}`
    }

    tile.addEventListener("click", function() {
        window.location.href = "player.html?Char=" + i
    })
}
let tile = grid.createElement("div")
tile.classList.add("characters-grid-other")

let subTile = tile.createElement("div")
subTile.textContent = "Create New Character"
subTile.addEventListener("click", function() {
    window.location.href = "newChar.html"
})
subTile = tile.createElement("div")
subTile.textContent = "Create From Preset"