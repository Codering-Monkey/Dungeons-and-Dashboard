import {id, numSuffix} from "../script.js"
import allData from "./sampleChar.json" with {type:"json"}
let playerData = allData[0]

// Generate Static Data
id("pfp").src = playerData["Pfp"]
id("name").textContent = playerData["Name"]
id("title").textContent = `${numSuffix(playerData["Level"])} level ${playerData["Species"]} ${playerData["Prefix"]} ${playerData["Class"]}`
id("speed").textContent = playerData["Speed"]

let prof = Math.ceil(playerData["Level"] / 4) + 1
id("pb").textContent = prof.symbol()

id("init").textContent = playerData["Init"].symbol()

id("ac").textContent = playerData["Armour"]

id("maxHealth").textContent = playerData["Max Health"]

if (playerData["Temp Health"] > 0) {
    id("health").textContent =  playerData["Current Health"] + " + " + playerData["Temp Health"]
} else {
    id("health").textContent =  playerData["Current Health"]
}

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
    let bonusNumber = document.createElement("p")
    let mod = Math.floor((playerData["Stats"][value] - 10) / 2)
    bonusNumber.textContent = mod.symbol()
    let profCheckbox = document.createElement("input")
    profCheckbox.type = "checkbox"
    if (playerData["Prof"].includes(key)) {
        profCheckbox.checked = true
        bonusNumber.textContent = (mod + prof).symbol()
    }
    container.shellAppend(profCheckbox)
    let expCheckbox = document.createElement("input")
    expCheckbox.type = "checkbox"
    if (playerData["Exp"].includes(key)) {
        expCheckbox.checked = true
        bonusNumber.textContent = (mod + (prof * 2)).symbol()
    }
    container.shellAppend(expCheckbox)

    container.shellAppend(bonusNumber)
    let name = document.createElement("p")
    name.textContent = key + " (" + value + ")"
    container.shellAppend(name)
})

const stats = ["Str", "Dex", "Con", "Int", "Wis", "Cha"]
let saveParent = id("save")
saveParent.clear(1)
for (let i = 0; i < stats.length; i++) {
    let value = playerData["Stats"][stats[i]];
    id(stats[i].toLowerCase() + "Stat").textContent = value
    let mod = Math.floor((value - 10) / 2)
    id(stats[i].toLowerCase() + "Mod").textContent = String(mod.symbol())

    let container = document.createElement("tr")
    saveParent.appendChild(container)
    let saveCheckbox = document.createElement("input")
    saveCheckbox.type = "checkbox"
    container.shellAppend(saveCheckbox)
    let name = document.createElement("p")
    let save = mod
    if (playerData["Saves"].includes(stats[i])) {
        save += 2
        saveCheckbox.checked = true
    }
    name.textContent = stats[i]
    container.shellAppend(name)
    let saveBonus  = document.createElement("p")
    saveBonus.textContent = String(save.symbol())
    container.shellAppend(saveBonus)
}