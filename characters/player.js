import { id } from "../script.js"
import playerData from "./sampleChar.json" with {type:"json"}
playerData = playerData[0]

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
profParent.clear(2)
Object.entries(proficiencies).forEach(([key, value]) => {
    let container = document.createElement("tr")
    profParent.appendChild(container)
    let profCheckbox = document.createElement("input")
    profCheckbox.type = "checkbox"
    container.shellAppend(profCheckbox)
    let expCheckbox = document.createElement("input")
    expCheckbox.type = "checkbox"
    container.shellAppend(expCheckbox)
    let bonusNumber = document.createElement("p")
    bonusNumber.textContent = "0"
    container.shellAppend(bonusNumber)
    let name = document.createElement("p")
    name.textContent = key + " (" + value + ")"
    container.shellAppend(name)
})

const stats = ["Str", "Dex", "Con", "Int", "Wis", "Cha"]
let saveParent = id("save")
saveParent.clear(1)
for (let i = 0; i < stats.length; i++) {
    let container = document.createElement("tr")
    saveParent.appendChild(container)
    let saveCheckbox = document.createElement("input")
    saveCheckbox.type = "checkbox"
    container.shellAppend(saveCheckbox)
    let name = document.createElement("p")
    name.textContent = stats[i]
    container.shellAppend(name)
    let saveBonus  = document.createElement("p")
    saveBonus.textContent = "+96"
    container.shellAppend(saveBonus)
}