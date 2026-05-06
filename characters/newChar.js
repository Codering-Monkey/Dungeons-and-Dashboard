import { id } from "../script.js"
import classes from "./classes.json" with { type: "json" }
import species from "./species.json" with { type: "json" }

let newCharacter = {}
let parent = id("parent")
let next = id("next")
next.addEventListener("click", function () {
    let stage = sessionStorage.get("createStage")
    if (stage === "Class") {
        newCharacter["Class"] = sessionStorage.get("Class")
        selectSpecies()
    }
})
let back = id("back")
back.addEventListener("click", function () {
    let stage = sessionStorage.get("createStage")
    if (stage === "Species") {
        newCharacter["Class"] = sessionStorage.get("Class")
        selectClass()
    }
})

function selectClass() {
    parent.clear()
    parent.className = "listParent"
    sessionStorage.set("createStage", "Class")
    if (!sessionStorage.get("Class")) {
        sessionStorage.set("Class", "parent")
    }
    Object.keys(classes).forEach((key) => {
        let listItem = document.createElement("div")
        listItem.id = key
        listItem.addEventListener("click", function () {
            id(sessionStorage.get("Class")).classList.remove("active")
            this.classList.add("active")
            sessionStorage.set("Class", key)
        })
        parent.appendChild(listItem)
        if (sessionStorage.get("Class") === key) {
            listItem.classList.add("active")
        }
        let listName = document.createElement("h2")
        listName.textContent = key
        listItem.appendChild(listName)
    })
}

function selectSpecies() {
    parent.clear()
    parent.className = "listParent"
    sessionStorage.set("createStage", "Species")
    if (!sessionStorage.get("Species")) {
        sessionStorage.set("Species", "parent")
    }
    Object.keys(species).forEach((key) => {
        let listItem = document.createElement("div")
        listItem.id = key
        listItem.addEventListener("click", function () {
            id(sessionStorage.get("Species")).classList.remove("active")
            this.classList.add("active")
            sessionStorage.set("Species", key)
        })
        parent.appendChild(listItem)
        if (sessionStorage.get("Species") === key) {
            listItem.classList.add("active")
        }
        let listName = document.createElement("h2")
        listName.textContent = key
        listItem.appendChild(listName)
    })
}

selectClass()

// localStorage.push("Characters", newCharacter)