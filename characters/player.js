import { id } from "../script.js"

const proficiencies = {
    "Acrobatics": "Dex",
    "Animal Handling": "Wis",
    "Arcana": "Int",
    "Athletics": "Str",
    "Deception": "Cha",
    "History": "Int",
    "Insight": "Wis",
    "Intimidation": "Cha",
    "Investigation": "Int",
    "Medicine": "Wis",
    "Nature": "Int",
    "Perception": "Wis",
    "Performance": "Cha",
    "Persuasion": "Cha",
    "Religion": "Int",
    "Sleight of Hand": "Dex",
    "Stealth": "Dex",
    "Survival": "Wis"
}

let profParent = id("prof")
profParent.clear(1)
Object.entries(proficiencies).forEach(([key, value]) => {
    let container = document.createElement("tr")
    profParent.appendChild(container)
    let profCheckbox = document.createElement("input")
    profCheckbox.type = "checkbox"
    container.shellAppend(profCheckbox)
    let expCheckbox = document.createElement("input")
    expCheckbox.type = "checkbox"
    container.shellAppend(expCheckbox)
    let bonusNumber = document.createElement("input")
    bonusNumber.type = "number"
    bonusNumber.disabled = true
    container.shellAppend(bonusNumber)
    let name = document.createElement("p")
    name.textContent = key + "(" + value + ")"
    container.shellAppend(name)
})