import {id, numSuffix, overlay, popup, roll} from "../script.js"
import allData from "./sampleChar.json" with {type:"json"}
let playerData = allData[0]

function render(initial=false) {
    // Generate Static Data
    id("pfp").src = playerData["Pfp"]
    id("name").textContent = playerData["Name"]
    id("title").textContent = `${numSuffix(playerData["Level"])} level ${playerData["Species"]} ${playerData["Prefix"]} ${playerData["Class"]}`
    id("speed").textContent = playerData["Speed"]

    let prof = Math.ceil(playerData["Level"] / 4) + 1
    id("pb").textContent = prof.symbol()

    let initObject = id("init")
    initObject.textContent = playerData["Init"].symbol()
    if (initial) {
        initObject.classList.add("clickable")
        initObject.addEventListener("click", function () {
            let dice = roll()
            if (playerData["Init"] > 0) {
                popup(`You rolled a ${dice + playerData["Init"]} on your initiative roll (${dice} + ${playerData["Init"]})`)
            } else if (playerData["Init"] < 0) {
                popup(`You rolled a ${dice + playerData["Init"]} on your initiative roll (${dice} - ${playerData["Init"] * -1})`)
            } else {
                popup(`You rolled a ${dice + playerData["Init"]} on your initiative roll`)
            }
        })
    }

    id("ac").textContent = playerData["Armour"]

    id("maxHealth").textContent = playerData["Max Health"]

    if (playerData["Temp Health"] > 0) {
        id("health").textContent = playerData["Current Health"] + " + " + playerData["Temp Health"]
    } else {
        id("health").textContent = String(playerData["Current Health"])
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
        let bonus = mod
        bonusNumber.textContent = mod.symbol()
        let profCheckbox = document.createElement("input")
        profCheckbox.type = "checkbox"
        if (playerData["Prof"].includes(key)) {
            profCheckbox.checked = true
            bonusNumber.textContent = (mod + prof).symbol()
            bonus += prof
        }
        container.shellAppend(profCheckbox)
        let expCheckbox = document.createElement("input")
        expCheckbox.type = "checkbox"
        if (playerData["Exp"].includes(key)) {
            expCheckbox.checked = true
            bonusNumber.textContent = (mod + (prof * 2)).symbol()
            bonus += prof
        }
        container.shellAppend(expCheckbox)

        container.shellAppend(bonusNumber)
        let name = document.createElement("p")
        name.textContent = key + " (" + value + ")"
        name.classList.add("clickable")
        name.addEventListener("click", function () {
            let dice = roll()
            if (bonus > 0) {
                popup(`You rolled a ${dice + bonus} on your ${key} roll (${dice} + ${bonus})`)
            } else if (bonus < 0) {
                popup(`You rolled a ${dice + bonus} on your ${key} roll (${dice} - ${bonus * -1})`)
            } else {
                popup(`You rolled a ${dice + bonus} on your ${key} roll`)
            }
        })
        container.shellAppend(name)
    })

    const stats = ["Str", "Dex", "Con", "Int", "Wis", "Cha"]
    let saveParent = id("save")
    saveParent.clear(1)
    for (let i = 0; i < stats.length; i++) {
        let value = playerData["Stats"][stats[i]];
        id(stats[i].toLowerCase() + "Stat").textContent = value
        let mod = Math.floor((value - 10) / 2)
        let modObject = id(stats[i].toLowerCase() + "Mod")
        modObject.textContent = String(mod.symbol())
        if (initial) {
            modObject.classList.add("clickable")
            modObject.addEventListener("click", function () {
                let dice = roll()
                if (save > 0) {
                    popup(`You rolled a ${dice + mod} on your ${stats[i]} roll (${dice} + ${mod})`)
                } else if (save < 0) {
                    popup(`You rolled a ${dice + mod} on your ${stats[i]} roll (${dice} - ${mod * -1})`)
                } else {
                    popup(`You rolled a ${dice + mod} on your ${stats[i]} roll`)
                }
            })
        }

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
        name.classList.add("clickable")
        name.addEventListener("click", function () {
            let dice = roll()
            if (save > 0) {
                popup(`You rolled a ${dice + save} on your ${stats[i]} save (${dice} + ${save})`)
            } else if (save < 0) {
                popup(`You rolled a ${dice + save} on your ${stats[i]} save (${dice} - ${save * -1})`)
            } else {
                popup(`You rolled a ${dice + save} on your ${stats[i]} save`)
            }
        })
        container.shellAppend(name)
        let saveBonus = document.createElement("p")
        saveBonus.textContent = String(save.symbol())
        container.shellAppend(saveBonus)
    }

    let defenses = id("defenses")
    defenses.clear()
    if (playerData["Resist"].length > 0) {
        let title = document.createElement("h5")
        title.textContent = "Resistances"
        defenses.appendChild(title)
        for (let i = 0; i < playerData["Resist"].length; i++) {
            let item = document.createElement("p")
            item.textContent = playerData["Resist"][i]
            defenses.appendChild(item)
        }
    }
    if (playerData["Immune"].length > 0) {
        let title = document.createElement("h5")
        title.textContent = "Immunities"
        defenses.appendChild(title)
        for (let i = 0; i < playerData["Immune"].length; i++) {
            let item = document.createElement("p")
            item.textContent = playerData["Immune"][i]
            defenses.appendChild(item)
        }
    }
    if (playerData["Weak"].length > 0) {
        let title = document.createElement("h5")
        title.textContent = "Weaknesses"
        defenses.appendChild(title)
        for (let i = 0; i < playerData["Weak"].length; i++) {
            let item = document.createElement("p")
            item.textContent = playerData["Weak"][i]
            defenses.appendChild(item)
        }
    }

    // Health
    if (initial) {
        id("heal").addEventListener("click", function () {
            playerData["Current Health"] += parseInt(id("healthChange")["value"])
            if (playerData["Current Health"] > playerData["Max Health"]) {
                playerData["Current Health"] = playerData["Max Health"]
            }
            render()
        })
        id("harm").addEventListener("click", function () {
            let amount = parseInt(id("healthChange")["value"])
            if (playerData["Temp Health"] > amount) {
                playerData["Temp Health"] -= amount
            } else {
                amount -= playerData["Temp Health"]
                playerData["Temp Health"] = 0
            }
            playerData["Current Health"] -= amount
            if (playerData["Current Health"] < 0) {
                playerData["Current Health"] = 0
            }
            render()
        })
        id("temp").addEventListener("click", function () {
            playerData["Temp Health"] = parseInt(id("healthChange")["value"])
            render()
        })
    }

    // Conditions
    let dndConditions = [
        "Blinded",
        "Charmed",
        "Deafened",
        "Frightened",
        "Grappled",
        "Incapacitated",
        "Invisible",
        "Paralyzed",
        "Petrified",
        "Poisoned",
        "Prone",
        "Restrained",
        "Stunned",
        "Unconscious",
        "Exhaustion"
    ]

    let condBox = id("conditions")
    condBox.clear()
    let conditions = playerData["Conditions"]
    let numberedConditions = {}
    for (let i = 0; i < conditions.length; i++) {
        numberedConditions[conditions[i]] = (numberedConditions[conditions[i]] || 0) + 1
    }
    Object.entries(numberedConditions).forEach(([key, value]) => {
        let item = document.createElement("p")
        if (value === 1) {
            item.textContent = key
        } else {
            item.textContent = value + "x " + key
        }
        condBox.append(item)
    })
    if (initial) {
        let condButton = id("condButton")
        condButton.addEventListener("click", function () {
            let box = overlay(function () {render()})
            let current = document.createElement("div")
            current.classList.add("current")
            box.appendChild(current)
            function renderCurrent() {
                current.clear()
                let conditions = playerData["Conditions"]
                let numberedConditions = {}
                for (let i = 0; i < conditions.length; i++) {
                    numberedConditions[conditions[i]] = (numberedConditions[conditions[i]] || 0) + 1
                }
                Object.entries(numberedConditions).forEach(([key, value]) => {
                    let item = document.createElement("div")
                    item.classList.add("clickable")
                    current.appendChild(item)
                    item.addEventListener("click", function () {
                        playerData["Conditions"].splice(playerData["Conditions"].indexOf(key), 1)
                        renderCurrent()
                    })

                    let bin  = document.createElement("span")
                    bin.classList.add("material-symbols-outlined")
                    bin.textContent = "delete"
                    item.appendChild(bin)

                    let text = document.createElement("p")
                    if (value === 1) {
                        text.textContent = key
                    } else {
                        text.textContent = value + "x " + key
                    }
                    item.append(text)
                })
            }
            renderCurrent()
            let add = document.createElement("div")
            add.classList.add("add")
            for (let i = 0; i < dndConditions.length; i++) {
                let button = document.createElement("button")
                button.textContent = dndConditions[i]
                button.style.width= "150px"
                button.style.margin = "4px"
                button.addEventListener("click", function () {
                    playerData["Conditions"].push(dndConditions[i])
                    renderCurrent()
                })
                add.appendChild(button)
            }
            box.appendChild(add)
        })
    }

//  Training
    let trainingCatagories = {"armourTraining": "ArmourTraining", "weaponTraining": "WeaponTraining", "toolTraining": "ToolTraining", "langTraining": "Languages"}
    Object.entries(trainingCatagories).forEach(([key, value]) => {
        id(key).textContent = playerData[value].commaFuse()
    })
}

render(true)