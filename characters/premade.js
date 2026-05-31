import {id} from "../script.js"
import premade from "../Data/premade.json" with {type:"json"}
premade.homebrew("Premade")

sessionStorage.set("selectedPremade", " # ")

let classParent = id("classList")
Object.entries(premade).forEach(([premadeClass, premadeCharacters]) => {
    classParent.createElement("h2").textContent = premadeClass
    let count = 0
    premadeCharacters.forEach((character) => {
        let classItem = classParent.createElement("h4")
        classItem.textContent = character["Name"]
        classItem.id = premadeClass + "#" + count
        if (classItem.id === sessionStorage.get("selectedPremade")) {
            classItem.classList.add("active")
            loadPremade()
        }
        classItem.addEventListener("click", function() {
            if (id(sessionStorage.get("selectedPremade"))) { id(sessionStorage.get("selectedPremade")).classList.remove("active") }
            this.classList.add("active")
            sessionStorage.set("selectedPremade", this.id)
            loadPremade()
        })
        count += 1
    })
})

let dataParent = id("charData")
function loadPremade() {
    dataParent.clear()
    let premadeData = premade[sessionStorage.get("selectedPremade").split("#")[0]][sessionStorage.get("selectedPremade").split("#")[1]]
    dataParent.createElement("h1").textContent = premadeData["Name"]
    dataParent.createElement("h3").innerHTML = `<strong>Class:</strong> ${premadeData["Class"]}`
    dataParent.createElement("h3").innerHTML = `<strong>Subclass:</strong> ${premadeData["Subclass"]}`
    dataParent.createElement("h3").innerHTML = `<strong>Species:</strong> ${premadeData["Species"]}`
    dataParent.createElement("h3").innerHTML = `<strong>Background:</strong> ${premadeData["Background"]}`
    dataParent.createElement("p").textContent = (premadeData["Lore"] || "")
}
