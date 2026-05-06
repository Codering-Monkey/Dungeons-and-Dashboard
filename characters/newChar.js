import { id } from "../script.js"
import classes from "./classes.json" with { type: "json" }

let newCharacter = {}
let parent = id("parent")
let next = id("next")
next.addEventListener("click", function () {
    if (parent.classList.contains("classParent")) {
        newCharacter["Class"] = sessionStorage.get("Class")
    }
})
let back = id("back")

function selectClass() {
    parent.clear(1)
    parent.className = "classParent"
    Object.keys(classes).forEach((key) => {
        let classItem = document.createElement("div")
        classItem.id = key
        classItem.addEventListener("click", function () {
            id(sessionStorage.get("Class")).classList.remove("active")
            this.classList.add("active")
            sessionStorage.set("Class", key)
        })
        parent.appendChild(classItem)
        if (sessionStorage.get("Class") === key) {
            classItem.classList.add("active")
        }
        let className = document.createElement("h2")
        className.textContent = key
        classItem.appendChild(className)
    })
}

selectClass()

// localStorage.push("Characters", newCharacter)