import { id } from "../script.js"
import classes from "./classes.json" with { type: "json" }
import species from "./species.json" with { type: "json" }
import backgrounds from "./backgrounds.json" with { type: "json" }

let newCharacter = {}
let parent = id("parent")
let next = id("next")
next.addEventListener("click", function () {
    let stage = sessionStorage.get("createStage")
    if (stage === "Class") {
        newCharacter["Class"] = sessionStorage.get("Class")
        selectList(species, "Species")
    } else if (stage === "Species") {
        newCharacter["Species"] = sessionStorage.get("Species")
        selectBackground(backgrounds, "Background")
    }
})
let back = id("back")
back.addEventListener("click", function () {
    let stage = sessionStorage.get("createStage")
    if (stage === "Species") {
        newCharacter["Species"] = sessionStorage.get("Species")
        selectList(classes, "Class")
    } else if (stage === "Background") {
        newCharacter["Background"] = sessionStorage.get("Background")
        selectList(species, "Species")
    }
})

function selectList(data, storageKey) {
    parent.clear()
    parent.className = "listParent"
    sessionStorage.set("createStage", storageKey)
    if (!sessionStorage.get(storageKey)) {
        sessionStorage.set(storageKey, "parent")
    }
    Object.keys(data).forEach((key) => {
        let listItem = document.createElement("div")
        listItem.id = key
        listItem.addEventListener("click", function () {
            id(sessionStorage.get(storageKey)).classList.remove("active")
            this.classList.add("active")
            sessionStorage.set(storageKey, key)
        })
        parent.appendChild(listItem)
        if (sessionStorage.get(storageKey) === key) {
            listItem.classList.add("active")
        }
        let listName = document.createElement("h2")
        listName.textContent = key
        listItem.appendChild(listName)
    })
}

selectList(classes, "Class")
// localStorage.push("Characters", newCharacter)