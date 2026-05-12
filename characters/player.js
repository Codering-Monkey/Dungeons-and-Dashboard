import {getQuery, id, numSuffix, overlay, popup, roll, setQuery} from "../script.js"
import allData from "./sampleChar.json" with {type:"json"}
import weapons from "./weapons.json" with {type:"json"}
import classes from "./classes.json" with {type:"json"}
import species from "./species.json" with {type:"json"}
import backgrounds from "./backgrounds.json" with {type:"json"}
import feats from "./feats.json" with {type:"json"}

let allStats = {
    "Strength": "Str",
    "Dexterity": "Dex",
    "Constitution": "Con",
    "Intelligence": "Int",
    "Wisdom": "Wis",
    "Charisma": "Cha",
}

// Proficiencies

let profCatagories = {
    "Skill": [
        "Acrobatics",
        "Animal Handling",
        "Arcana",
        "Athletics",
        "Deception",
        "History",
        "Insight",
        "Intimidation",
        "Investigation",
        "Medicine",
        "Nature",
        "Perception",
        "Performance",
        "Persuasion",
        "Religion",
        "Sleight of Hand",
        "Stealth",
        "Survival"
    ],
    "Gaming Set": [
        "Dice Set",
        "Playing Card Set"
    ],
    "Language": [
        "Common",
        "Elvish",
        "Dwarvish",
        "Halfling",
        "Gnomish",
        "Giant",
        "Goblin",
        "Orc"
    ]
}

function proficiencyChoose(profItem, existingProf) {
    let overlayParent = overlay(function() {}, false)
    overlayParent.classList.add('profOverlay')
    let possibleChoices
    if ("Catagory" in profItem) {
        possibleChoices = profCatagories[profItem["Catagory"]]
    } else if ("Choices" in profItem) {
        possibleChoices = profItem["Choices"]
    } else {
        throw TypeError("Incorrectly formatted profItem")
    }
    let profTitle = document.createElement("h2")
    profTitle.textContent = `Choose ${profItem["Amount"]}`
    overlayParent.appendChild(profTitle)
    let profContainer = document.createElement("div")
    overlayParent.appendChild(profContainer)
    for (let i = 0; i < possibleChoices.length; i++) {
        let profItem = document.createElement("input")
        profItem.type = "Checkbox"
        profItem.id = "choice" + i
        profItem.value = possibleChoices[i]
        profItem.classList.add("usable")
        profContainer.appendChild(profItem)
        let profLabel = document.createElement("label")
        profLabel.textContent = possibleChoices[i]
        profLabel.htmlFor = "choice" + i
        if (existingProf.includes(possibleChoices[i])) {
            profLabel.style.opacity = "50%"
        }
        profContainer.appendChild(profLabel)
        profContainer.break()
    }
    let profButton = document.createElement("button")
    profButton.textContent = "Close"
    overlayParent.appendChild(profButton)
    return new Promise((resolve) => {
        profButton.addEventListener("click", function() {
            let selected = []
            let checkboxes = profContainer.getElementsByTagName("INPUT")
            for (let i = 0; i < checkboxes.length; i++) {
                if (checkboxes[i].checked) {
                    selected.push(checkboxes[i].value)
                }
            }
            if (selected.length === profItem["Amount"]) {
                overlayParent.parentElement.remove()
                resolve(selected)
            } else {
                popup(`Please select ${profItem["Amount"]} options`)
            }
        })
    })
}

// Feats

function featChoose(featItem) {
    let overlayParent = overlay(function() {}, false)
    overlayParent.classList.add('featOverlay')
    let possibleChoices = []
    if ("Type" in featItem) {
        Object.entries(feats).forEach(([key, value]) => {
            if (featItem["Type"].includes(value["Type"])) {
                possibleChoices.push(key)
            }
        })
    } else if ("Choices" in featItem) {
        possibleChoices = featItem["Choices"]
    } else {
        throw TypeError("Incorrectly formatted featItem")
    }
    let possibleFeats = {}
    for (let i = 0; i < possibleChoices.length; i++) {
        possibleFeats[possibleChoices[i]] = feats[possibleChoices[i]]["Description"]
    }
    let featScroll = document.createElement("div")
    overlayParent.appendChild(featScroll)
    Object.entries(possibleFeats).forEach(([key, value]) => {
        let featItem = document.createElement("div")
        featScroll.appendChild(featItem)
        let featTitle = document.createElement("h3")
        featTitle.textContent = key
        featItem.appendChild(featTitle)
        let featText = document.createElement("p")
        featText.textContent = value
        featItem.appendChild(featText)
        featItem.addEventListener("click", function() {
            if (this.classList.contains("selectedFeat")) {
                this.classList.remove("selectedFeat")
            } else {
                if (document.getElementsByClassName("selectedFeat")[0]) {
                    document.getElementsByClassName("selectedFeat")[0].classList.remove("selectedFeat")
                }
                this.classList.add("selectedFeat")
            }
        })
    })
    let finishButton = document.createElement("button")
    finishButton.textContent = "Select"
    overlayParent.appendChild(finishButton)
    return new Promise((resolve) => {
        finishButton.addEventListener("click", function() {
            if (document.getElementsByClassName("selectedFeat") && document.getElementsByClassName("selectedFeat")[0]) {
                resolve(document.getElementsByClassName("selectedFeat")[0].children[0].textContent)
                overlayParent.parentElement.remove()
            } else {
                popup(`Please select a Feat`)
            }
        })
    })
}


// Load the Page

async function developData() {
    let player = localStorage.indexGet("Characters", getQuery("Char"))
    player["Stats"] = {}
    Object.entries(player["BaseStats"]).forEach(([key, value]) => {
        player["Stats"][allStats[key]] = value
    })
    Object.entries(player["Bonus"]).forEach(([key, value]) => {
        for (let i = 0; i < value.length; i++) {
            player["Stats"][allStats[value[i]]] += parseInt(key)
        }
    })
    if (!player["Choices"]["Language"]) {
        player["Choices"]["Language"] = await proficiencyChoose({"Amount": 3, "Catagory": "Language"}, player["Prof"])
    }
    if (player["Choices"]["Language"].length === 0) {
        player["Choices"]["Language"] = await proficiencyChoose({"Amount": 3, "Catagory": "Language"}, player["Prof"])
    }
    player["Languages"].pushAll(player["Choices"]["Language"])
    if (!("Background" in player["Choices"])) {
        player["Choices"]["Background"] = []
        for (let i = 0; i < backgrounds[player["Background"]]["Prof"].length; i++) {
            player["Choices"]["Background"].pushAll(await proficiencyChoose(backgrounds[player["Background"]]["Prof"][i], player["Prof"]))
        }
    }
    player["Prof"].pushAll(player["Choices"]["Background"])
    if (!("Class" in player["Choices"])) {
        player["Choices"]["Class"] = await proficiencyChoose(classes[player["Class"]]["Prof"][0], player["Prof"])
    }
    player["Prof"].pushAll(player["Choices"]["Class"])

    player["Feats"].push(backgrounds[player["Background"]]["Feat"])

    async function addFeatures(dataSource) {
        for (const [key, value] of Object.entries(dataSource)) {
            if ("Level" in value) {
                if (value["Level"] > player["Level"]) {
                    continue;
                }
            }
            if (key in player["Choices"]) {
                if ("Prof" in player["Choices"][key]) {
                    player["Prof"].pushAll(player["Choices"][key]["Prof"])
                }
                if ("Feat" in player["Choices"][key]) {
                    player["Feats"].push(player["Choices"][key]["Feat"])
                }

            } else {
                player["Choices"][key] = {}
                if ("Prof" in value) {
                    let profChoices = []
                    for (let i = 0; i < value["Prof"].length; i++) {
                        profChoices.pushAll(await proficiencyChoose(value["Prof"][i], player["Prof"]))
                    }
                    player["Choices"][key]["Prof"] = profChoices
                    player["Prof"].pushAll(profChoices)
                }
                if ("Feat" in value) {
                    let featChoices = []
                    for (let i = 0; i < value["Feat"].length; i++) {
                        featChoices.push(await featChoose(value["Feat"][i]))
                    }
                    player["Choices"][key]["Feat"] = featChoices
                    player["Feats"].pushAll(featChoices)
                }
            }
        }
        let basePlayer = localStorage.get("Characters")
        basePlayer[getQuery("Char")]["Choices"] = player["Choices"]
        localStorage.set("Characters", basePlayer)
    }
    await addFeatures(classes[player["Class"]]["Features"])
    await addFeatures(species[player["Species"]]["Features"])
    let featData = {}
    for (let i = 0; i < player["Feats"].length; i++) {
        featData[player["Feats"][i]] = feats[player["Feats"][i]]
    }
    await addFeatures(featData)

    player["Init"] = player["Stats"]["Dex"].modifier()
    player["Max Health"] = classes[player["Class"]]["Dice"] + ((classes[player["Class"]]["Dice"] / 2 + 1) * (player["Level"] - 1)) + (player["Level"] * player["Stats"]["Con"].modifier())
    if (player["Current Health"] > player["Max Health"]) {
        player["Current Health"] = player["Max Health"]
    }
    player["Saves"] = classes[player["Class"]]["Saves"]
    player["Attacks"] = classes[player["Class"]]["Attacks"][player["Level"]]
    player["Speed"] = species[player["Species"]]["Speed"]

    return player
}

function render(playerData, initial=false) {
    // Generate Static Data
    id("pfp").src = (playerData["Pfp"] || "../Images/players/blank.png")
    id("name").textContent = playerData["Name"]
    if (playerData["Level"] < 3) {
        id("title").textContent = `${numSuffix(playerData["Level"])} level ${playerData["Species"]} ${playerData["Class"]}`
    } else {
       id("title").textContent = `${numSuffix(playerData["Level"])} level ${playerData["Species"]} ${playerData["Prefix"]} ${playerData["Class"]}`
    }
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
        let mod = playerData["Stats"][value].modifier()
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
            render(playerData)
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
            render(playerData)
        })
        id("temp").addEventListener("click", function () {
            playerData["Temp Health"] = parseInt(id("healthChange")["value"])
            render(playerData)
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
            let box = overlay(function () {render(playerData)})
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

//  Actions
    let tabs = ["actions", "spells", "inv", "feat", "set"]
    if (initial) {
        for (let i = 0; i < tabs.length; i++) {
            id(tabs[i] + "Tab").addEventListener("click", function () {
                id(getQuery("tab") + "Tab").classList.remove("active")
                setQuery("tab", tabs[i])
                id(tabs[i] + "Tab").classList.add("active")
                renderAction()
            })
        }
    }
    let currentTab
    if (getQuery(tabs)) {
        currentTab = getQuery("tab")
    } else {
       currentTab = "actions"
    }
    id(currentTab + "Tab").classList.add("active")
    setQuery("tab", currentTab)

    function renderAction() {
        let actionParent = id("actionParent")
        actionParent.clear()
        let selectedAction = getQuery("tab")
        if (selectedAction === "actions") {
            let actionCatagories = ["Action", "Bonus Action", "Reaction", "Other"]
            let catagoryFilter = document.createElement("div")
            catagoryFilter.classList.add("action-filter")
            actionParent.appendChild(catagoryFilter)
            for (let i = 0; i < actionCatagories.length; i++) {
                let actionFilterSelect = document.createElement("button")
                actionFilterSelect.textContent = actionCatagories[i]
                actionFilterSelect.addEventListener("click", function() {
                    window.location.hash = "#" + actionCatagories[i].toLowerCase()
                })
                catagoryFilter.appendChild(actionFilterSelect)
            }
            let actionBody = document.createElement("div")
            actionBody.classList.add("action-body")
            actionParent.appendChild(actionBody)

            let actionsTitle = document.createElement("h2")
            actionsTitle.id = "action"
            actionsTitle.textContent = "Actions"
            actionBody.appendChild(actionsTitle)
            actionBody.break(2)
            let attacksTitle = document.createElement("h3")
            attacksTitle.innerHTML = "Attacks <span style='font-size: .75em; color: var(--sub-text)'>(" + playerData["Attacks"] + " Attack" + (playerData["Attacks"] > 1 ? "s" : "") + " per Action)</span>"
            actionBody.appendChild(attacksTitle)
            actionBody.break(2)
            let actionsTable = document.createElement("table")
            actionBody.appendChild(actionsTable)
            let playerWeapons = []
            for (let i = 0; i < playerData["Equipment"].length; i++) {
                if (playerData["Equipment"][i][0] in weapons) {
                    playerWeapons.push(playerData["Equipment"][i])
                }
            }
            playerWeapons.push(["Unarmed Strike", 1])
            let weaponsTitle = document.createElement("tr")
            let columns = ["Attack", "Range", "Hit", "Damage", "Notes"]
            for (let i = 0; i < columns.length; i++) {
                let header = document.createElement("th")
                header.textContent = columns[i]
                weaponsTitle.appendChild(header)
            }
            actionsTable.appendChild(weaponsTitle)
            for (let i = 0; i < playerWeapons.length; i++) {
                let weaponLine = document.createElement("tr")
                let weaponData = weapons[playerWeapons[i][0]]
                let name = document.createElement("td")
                name.textContent = playerWeapons[i][1] > 1 ? `${playerWeapons[i][0]} (${playerWeapons[i][1]})` : playerWeapons[i][0]
                weaponLine.appendChild(name)
                actionsTable.appendChild(weaponLine)
            }

        }
    }

    renderAction()

}

render(await developData(), true)