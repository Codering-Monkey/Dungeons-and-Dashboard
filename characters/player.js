import {getQuery, id, numSuffix, overlay, popup, roll, setQuery} from "../script.js"
import weapons from "./weapons.json" with {type:"json"}
import classes from "./classes.json" with {type:"json"}
import species from "./species.json" with {type:"json"}
import backgrounds from "./backgrounds.json" with {type:"json"}
import feats from "./feats.json" with {type:"json"}
import armour from "./armour.json" with {type:"json"}

let allStats = {
    "Strength": "Str",
    "Dexterity": "Dex",
    "Constitution": "Con",
    "Intelligence": "Int",
    "Wisdom": "Wis",
    "Charisma": "Cha",
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

Object.prototype.statEval = function(string) {
    let split = string.split("+")
    if (!Array.isArray(split)) {
        split = [split]
    }
    let amount = 0
    for (let i = 0; i < split.length; i++) {
        split[i] = split[i].capitalise()
        if (Number.isFinite(Number(split[i]))) {
            amount += parseInt(split[i])
        } else if (split[i] in this["Stats"]) {
            amount += this["Stats"][split[i]].modifier()
        } else if (split[i] in proficiencies) {
            amount += this["Stats"][proficiencies[split[i]]].modifier()
            if (this["Prof"].includes(split[i]) ) {
                if (this["Exp"].includes(split[i])) {
                    amount += this["Prof Bonus"]
                }
                amount += this["Prof Bonus"]
            }
        } else if (split[i] === "Prof") {
            amount += this["Prof Bonus"]
        } else if (split[i].search("^d[0-9]+")) {
            amount += roll(parseInt(split[i].slice(1)))
        }
    }
    return amount
}

function healthSave(player) {
    let basePlayer = localStorage.get("Characters")
    basePlayer[getQuery("Char")]["Max Health"] = player["Max Health"]
    basePlayer[getQuery("Char")]["Temp Health"] = player["Temp Health"]
    basePlayer[getQuery("Char")]["Current Health"] = player["Current Health"]
    localStorage.set("Characters", basePlayer)
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
    "Artisan's Tools": [

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
            profItem.disabled = true
        }
        profContainer.appendChild(profLabel)
        profContainer.break()
    }
    let profButton = document.createElement("button")
    profButton.textContent = "Confirm"
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

function featChoose(featItem, existingFeat) {
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
        if (existingFeat.includes(key)) {
            featItem.style.opacity = "50%"
        } else {
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
        }
    })
    let finishButton = document.createElement("button")
    finishButton.textContent = "Confirm"
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
    player["Prof Bonus"] = Math.ceil(player["Level"] / 4) + 1
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

    if (!("Hit Dice" in player)) {
        player["Hit Dice"] = player["Level"]
    }

    player["ArmourPermitted"] = classes[player["Class"]]["Armour"]
    player["Armour"] = {"Unarmoured": {"Type": "Other", "Amount": "10", "Cap": -1}}
    player["Weapons"] = {"Unarmed Strike": 1}
    Object.entries(player["Equipment"]).forEach(([key, value]) => {
        if (key in weapons) {
            player["Weapons"][key] = value
        }
        if (key in armour) {
            player["Armour"][key] = armour[key]
        }
    })

    player["Init"] = player["Stats"]["Dex"].modifier()

    player["WeaponsPermitted"] = classes[player["Class"]]["Weapons"]
    player["Actions"] = []
    if (!player["Resources"]) {player["Resources"] = {}}

    player["Features"] = {}
    async function addFeatures(dataSource, sourceName) {
        player["Features"][sourceName] = {}
        for (const [key, value] of Object.entries(dataSource)) {
            if ("Level" in value) {
                if (value["Level"] > player["Level"]) {
                    continue;
                }
            }
            player["Features"][sourceName][key] = eval(`let level = ${player["Level"]};\`${value["Description"]}\``)
            if ("Armour" in value) {
                player["Armour"][value["Armour"]["Name"]] = {"Type": value["Armour"]["Type"], "Amount": value["Armour"]["Amount"], "Cap": value["Armour"]["Cap"]}
            }
            if ("Action" in value) {
                for (let i = 0; i < value["Action"].length; i++) {
                    let currentAction = value["Action"][i]
                    player["Actions"].push(currentAction)
                    if ("Usages" in currentAction) {
                        if (!(currentAction["Name"] in player["Resources"])) {
                            player["Resources"][currentAction["Name"]] = {"Current": currentAction["Usages"][player["Level"]], "Max": currentAction["Usages"][player["Level"]], "LR": (currentAction["LR"] || 0), "SR": (currentAction["SR"] || 0)}
                        } else if (player["Resources"][currentAction["Name"]]["Max"] < currentAction["Usages"][player["Level"] - 1]) {
                            let difference = currentAction["Usages"][player["Level"]] - player["Resources"][currentAction["Name"]]["Max"]
                            player["Resources"][currentAction["Name"]]["Max"] += difference
                            player["Resources"][currentAction["Name"]]["Current"] += difference
                        }
                        let basePlayer = localStorage.get("Characters")
                        basePlayer[getQuery("Char")]["Resources"] = player["Resources"]
                        localStorage.set("Characters", basePlayer)
                    }
                }
            }
            if ("Bonus" in value) {
                for (let i = 0; i < value["Bonus"].length; i++) {
                    let amount = value["Bonus"][i]["Amount"]
                    if (amount === "pb") {
                        amount = player["Prof Bonus"]
                    }
                    if (Object.values(allStats).includes(value["Bonus"][i]["Stat"])) {
                        player["Stats"][value["Bonus"][i]["Stat"]] += amount
                        if (player["Stats"][value["Bonus"][i]["Stat"]] > value["Bonus"][i]["Cap"]) {
                            player["Stats"][value["Bonus"][i]["Stat"]] = value["Bonus"][i]["Cap"]
                        }
                    } else if (value["Bonus"][i]["Stat"] === "Init") {
                        player["Init"] += amount
                    }
                }
            }
            if (key in player["Choices"]) {
                if ("Prof" in player["Choices"][key]) {
                    player["Prof"].pushAll(player["Choices"][key]["Prof"])
                }
                if ("Feat" in player["Choices"][key]) {
                    player["Feats"].pushAll(player["Choices"][key]["Feat"])
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
                        featChoices.push(await featChoose(value["Feat"][i], player["Feats"]))
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
    await addFeatures(classes[player["Class"]]["Features"], player["Class"])
    await addFeatures(species[player["Species"]]["Features"], player["Species"])
    let featData = {}
    for (let i = 0; i < player["Feats"].length; i++) {
        featData[player["Feats"][i]] = feats[player["Feats"][i]]
    }
    await addFeatures(featData, "Feats")

    player["ToolTraining"] = []
    for (let i = 0; i < profCatagories["Artisan's Tools"].length; i++) {
        if (player["Prof"].includes(profCatagories["Artisan's Tools"][i])) {
            player["ToolTraining"].push(profCatagories["Artisan's Tools"][i])
        }
    }
    for (let i = 0; i < profCatagories["Gaming Set"].length; i++) {
        if (player["Prof"].includes(profCatagories["Gaming Set"][i])) {
            player["ToolTraining"].push(profCatagories["Gaming Set"][i])
        }
    }

    player["ArmourTraining"] = []
    if (player["ArmourPermitted"][0]) {
        player["ArmourTraining"].push("Light")
    }
    if (player["ArmourPermitted"][1]) {
        player["ArmourTraining"].push("Medium")
    }
    if (player["ArmourPermitted"][2]) {
        player["ArmourTraining"].push("Heavy")
    }
    if (player["ArmourPermitted"][3]) {
        player["ArmourTraining"].push("Shields")
    }

    player["WeaponTraining"] = structuredClone(player["WeaponsPermitted"][2])
    if (player["WeaponsPermitted"][0]) {
        player["WeaponTraining"].push("Simple")
    }
    if (player["WeaponsPermitted"][1]) {
        player["WeaponTraining"].push("Martial")
    }

    player["Max Health"] = classes[player["Class"]]["Dice"] + ((classes[player["Class"]]["Dice"] / 2 + 1) * (player["Level"] - 1)) + (player["Level"] * player["Stats"]["Con"].modifier())
    if (player["Current Health"] > player["Max Health"]) {
        player["Current Health"] = player["Max Health"]
    }
    player["Saves"] = classes[player["Class"]]["Saves"]
    player["Attacks"] = classes[player["Class"]]["Attacks"][player["Level"]]
    player["Speed"] = species[player["Species"]]["Speed"]

    player["Armour Class"] = 0
    let armourData = player["Armour"][player["EquipArmour"]]
    if (!armourData) {
        let oldData = localStorage.get("Characters")
        oldData[getQuery("Char")]["EquipArmour"] = "Unarmoured"
        localStorage.set("Characters", oldData)
        armourData = armour["Unarmoured"]
    }
    player["Armour Class"] = player.statEval(armourData["Amount"])
    let dexBonus = player["Stats"]["Dex"].modifier()
    if (armourData["Cap"] !== -1) {
        if (dexBonus > armourData["Cap"]) {
            dexBonus = armourData["Cap"]
        }
    }
    player["Armour Class"] += dexBonus

    return player
}

async function render(playerData, initial=false) {
    // Generate Static Data
    id("pfp").src = (playerData["Pfp"] || "../Images/players/blank.png")
    id("name").textContent = playerData["Name"]
    if (playerData["Level"] < 3) {
        id("title").textContent = `${numSuffix(playerData["Level"])} level ${playerData["Species"]} ${playerData["Class"]}`
    } else {
       id("title").textContent = `${numSuffix(playerData["Level"])} level ${playerData["Species"]} ${playerData["Prefix"]} ${playerData["Class"]}`
    }
    id("speed").textContent = playerData["Speed"]

    id("pb").textContent = playerData["Prof Bonus"].symbol()

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

    id("ac").textContent = playerData["Armour Class"]

    id("maxHealth").textContent = playerData["Max Health"]

    if (playerData["Temp Health"] > 0) {
        id("health").textContent = playerData["Current Health"] + " + " + playerData["Temp Health"]
    } else {
        id("health").textContent = String(playerData["Current Health"])
    }

    id("hitDice").textContent = `Roll Hit Dice (${playerData["Hit Dice"]}/${playerData["Level"]})`
    if (initial) {
        id("hitDice").addEventListener("click", function () {
            if (playerData["Current Health"] === playerData["Max Health"]) {
                popup("Your health is already full")
            } else {
                if (playerData["Hit Dice"] > 0) {
                    let diceSize = classes[playerData["Class"]]["Dice"]
                    let diceRoll = roll(diceSize)
                    popup(`You Healed ${diceRoll + playerData["Stats"]["Con"].modifier()} (${diceRoll} (d${diceSize}) + ${playerData["Stats"]["Con"].modifier()})`)
                    playerData["Current Health"] += diceRoll + playerData["Stats"]["Con"].modifier()
                    if (playerData["Current Health"] > playerData["Max Health"]) {
                        playerData["Current Health"] = playerData["Max Health"]
                    }
                    healthSave(playerData)
                    let basePlayer = localStorage.get("Characters")
                    basePlayer[getQuery("Char")]["Hit Dice"] -= 1
                    playerData["Hit Dice"] -= 1
                    localStorage.set("Characters", basePlayer)
                    this.textContent = `Roll Hit Dice (${playerData["Hit Dice"]}/${playerData["Level"]})`
                    render(playerData)
                }
            }
        })
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
            bonusNumber.textContent = (mod + playerData["Prof Bonus"]).symbol()
            bonus += playerData["Prof Bonus"]
        }
        container.shellAppend(profCheckbox)
        let expCheckbox = document.createElement("input")
        expCheckbox.type = "checkbox"
        if (playerData["Exp"].includes(key)) {
            expCheckbox.checked = true
            bonusNumber.textContent = (mod + (prof * 2)).symbol()
            bonus += playerData["Prof Bonus"]
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

    // Health & rest
    if (initial) {
        id("heal").addEventListener("click", function () {
            if (parseInt(id("healthChange")["value"])) {
                playerData["Current Health"] += parseInt(id("healthChange")["value"])
                if (playerData["Current Health"] > playerData["Max Health"]) {
                    playerData["Current Health"] = playerData["Max Health"]
                }
                healthSave(playerData)
                render(playerData)
            }
        })
        id("harm").addEventListener("click", function () {
            let amount = parseInt(id("healthChange")["value"])
            if (amount) {
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
                healthSave(playerData)
                render(playerData)
            }
        })
        id("temp").addEventListener("click", function () {
            if (parseInt(id("healthChange")["value"])) {
                playerData["Temp Health"] = parseInt(id("healthChange")["value"])
                healthSave(playerData)
                render(playerData)
            }
        })
        id("sr").addEventListener("click", async function() {
            let basePlayer = localStorage.get("Characters")
            let resources = playerData["Resources"]
            Object.entries(resources).forEach(([key, value]) => {
                if ("SR" in value) {
                    if (value["SR"] === -1) {
                        resources[key]["Current"] = resources[key]["Max"]
                    } else {
                        resources[key]["Current"] += value["SR"]
                    }
                    if (resources[key]["Current"] > value["Max"]) {
                        resources[key]["Current"] = value["Max"]
                    }
                }
            })
            basePlayer[getQuery("Char")]["Resources"] = resources
            playerData["Resources"] = resources
            localStorage.set("Characters", basePlayer)
            popup("Short Rest Complete, Dont Forget to Roll Hit Dice")
            await render(playerData)
        })
        id("lr").addEventListener("click", async function() {
            let basePlayer = localStorage.get("Characters")
            let resources = playerData["Resources"]
            Object.entries(resources).forEach(([key, value]) => {
                if ("LR" in value) {
                    if (value["LR"] === -1) {
                        resources[key]["Current"] = resources[key]["Max"]
                    } else {
                        resources[key]["Current"] += value["LR"]
                    }
                    if (resources[key]["Current"] > value["Max"]) {
                        resources[key]["Current"] = value["Max"]
                    }
                }
            })
            basePlayer[getQuery("Char")]["Resources"] = resources
            playerData["Resources"] = resources
            basePlayer[getQuery("Char")]["Current Health"] = basePlayer[getQuery("Char")]["Max Health"]
            playerData["Current Health"] = playerData["Max Health"]
            let hitDice = Math.floor(playerData["Level"] / 2)
            if (hitDice < 1) {hitDice = 1}
            basePlayer[getQuery("Char")]["Hit Dice"] += hitDice
            playerData["Hit Dice"] += hitDice
            if (basePlayer[getQuery("Char")]["Hit Dice"] > basePlayer[getQuery("Char")]["Level"]) {
                basePlayer[getQuery("Char")]["Hit Dice"] = basePlayer[getQuery("Char")]["Level"]
                playerData["Hit Dice"] = playerData["Level"]
            }
            localStorage.set("Characters", basePlayer)
            await render(playerData)
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
    } else {
        for (let i = 0; i < tabs.length; i++) {
            id(tabs[i] + "Tab").classList.remove("active")
        }
    }
    let currentTab
    if (getQuery("tab")) {
        currentTab = getQuery("tab")
    } else {
       currentTab = "actions"
    }
    id(currentTab + "Tab").classList.add("active")
    setQuery("tab", currentTab)

    async function renderAction() {
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
            let weaponsTitle = document.createElement("tr")
            let columns = ["Attack", "Range", "Hit", "Damage", "Notes"]
            for (let i = 0; i < columns.length; i++) {
                let header = document.createElement("th")
                header.textContent = columns[i]
                weaponsTitle.appendChild(header)
            }
            actionsTable.appendChild(weaponsTitle)
            let weaponOptions = playerData["Weapons"]
            weaponOptions["Shove"] = 1
            weaponOptions["Grapple"] = 1
            Object.entries(weaponOptions).forEach(([key, value]) => {
                let weaponData = weapons[key]
                let proficient = (playerData["WeaponTraining"].includes(weaponData["Type"]) || playerData["WeaponTraining"].includes(key))
                let statBonus = weaponData["Type"] === "Ranged" ? playerData["Stats"]["Dex"].modifier() : playerData["Stats"]["Str"].modifier()

                let weaponLine = document.createElement("tr")
                actionsTable.appendChild(weaponLine)

                let name = document.createElement("td")
                name.textContent = value > 1 ? `${key} (${value})` : key
                weaponLine.appendChild(name)

                let range = document.createElement("td")
                range.textContent = weaponData["Type"] === "Ranged" ? weaponData["Range"][0] + "ft / " + weaponData["Range"][1] + "ft" : "Melee"
                weaponLine.appendChild(range)

                let hit = document.createElement("td")
                if ("DC" in weaponData) {
                    hit.textContent = "DC " + String(playerData.statEval(weaponData["DC"]))
                } else {
                    hit.textContent = (statBonus  + (proficient ? (weaponData["Type"] === "Ranged" ? playerData["Stats"]["Dex"] : playerData["Stats"]["Str"]): 0)).symbol()
                }
                weaponLine.appendChild(hit)

                let damage = document.createElement("td")
                if ("AltDamage" in weaponData) {
                    damage.textContent = weaponData["AltDamage"]
                } else {
                    damage.textContent = weaponData["Dice"][0] + "d" + weaponData["Dice"][1] + statBonus.bonus()
                    damage.classList.add("clickable")
                    damage.addEventListener("click", function() {
                        let dice = []
                        let diceString = ""
                        for (let i = 0; i < weaponData["Dice"][0]; i++) {
                            dice.push(roll(weaponData["Dice"][1]))
                            diceString += dice[i] + " + "
                        }
                        diceString.slice(0, - 3)
                        popup(`You rolled a ${dice.sum() + statBonus} on your ${key} roll (${diceString}${statBonus})`)
                    })
                }
                weaponLine.appendChild(damage)

                let notes = document.createElement("td")
                notes.textContent = weaponData["Properties"].commaFuse()
                weaponLine.appendChild(notes)
            })

            let otherActionParent = document.createElement("div")
            let otherActionTitle = document.createElement("h3")
            otherActionTitle.textContent = "Other Actions"
            otherActionParent.appendChild(otherActionTitle)
            otherActionParent.classList.add("actionParent")
            let otherActions = [
                "Dash",
                "Disengage",
                "Dodge",
                "Escape",
                "Help",
                "Hide",
                "Ready",
            ]
            for (let i = 0; i < otherActions.length; i++) {
                let item = document.createElement("p")
                item.textContent = otherActions[i]
                item.classList.add("generic")
                otherActionParent.appendChild(item)
            }
            actionBody.appendChild(otherActionParent)

            let bonusActionParent = document.createElement("div")
            bonusActionParent.classList.add("actionParent")
            actionBody.appendChild(bonusActionParent)

            let bonusActionsTitle = document.createElement("h2")
            bonusActionsTitle.id = "bonus action"
            bonusActionsTitle.textContent = "Bonus Actions"
            bonusActionParent.appendChild(bonusActionsTitle)

            let item = document.createElement("p")
            item.textContent = "Offhand Attack"
            item.classList.add("generic")
            bonusActionParent.appendChild(item)

            let reactionParent = document.createElement("div")
            let reactionTitle = document.createElement("h2")
            reactionTitle.textContent = "Reactions"
            reactionParent.appendChild(reactionTitle)
            reactionParent.classList.add("actionParent")
            let reactions = [
                "Opportunity Attack",
                "Readied Action"
            ]
            for (let i = 0; i < reactions.length; i++) {
                let item = document.createElement("p")
                item.textContent = reactions[i]
                item.classList.add("generic")
                reactionParent.appendChild(item)
            }
            actionBody.appendChild(reactionParent)

            let otherParent = document.createElement("div")
            let otherTitle = document.createElement("h2")
            otherTitle.textContent = "Other"
            otherParent.appendChild(otherTitle)
            otherParent.classList.add("actionParent")
            actionBody.appendChild(otherParent)

            for (let i = 0; i < playerData["Actions"].length; i++) {
                let action = playerData["Actions"][i]
                let item = document.createElement("div")
                item.classList.add("special")
                let itemText = document.createElement("p")
                itemText.textContent = action["Name"]
                item.appendChild(itemText)
                if (action["Name"] in playerData["Resources"]) {
                    let resource = playerData["Resources"][action["Name"]]
                    let itemUses = document.createElement("div")
                    itemUses.classList.add("checkboxBox")
                    for (let j = 0; j < resource["Max"]; j++) {
                        let use = document.createElement("input")
                        use.type = "checkbox"
                        use.checked = (j + 1) <= resource["Current"]
                        use.value = action["Name"]
                        use.classList.add("usable")
                        use.addEventListener("click", function() {
                            let active = 0
                            let checkboxes = this.parentElement.children
                            for (let k = 0; k < checkboxes.length; k++) {
                                if (checkboxes[k].checked) {
                                    active += 1
                                }
                            }
                            playerData["Resources"][this.value]["Current"] = active
                            let basePlayer = localStorage.get("Characters")
                            basePlayer[getQuery("Char")]["Resources"][this.value]["Current"] = active
                            localStorage.set("Characters", basePlayer)
                        })
                        itemUses.appendChild(use)
                    }
                    item.appendChild(itemUses)
                }
                if (action["Type"] === "Action") {
                    otherActionParent.appendChild(item)
                } else if (action["Type"] === "Bonus") {
                    bonusActionParent.appendChild(item)
                } else if (action["Type"] === "Reactions") {
                    reactionParent.appendChild(item)
                } else {
                    otherParent.appendChild(item)
                }
            }
        } else if (selectedAction === "spells") {

        } else if (selectedAction === "inv") {
            let armourLabel = document.createElement("label")
            actionParent.appendChild(armourLabel)
            let armourNames = Object.keys(playerData["Armour"])
            let armourNamesWithStats = []
            for (let i = 0; i < armourNames.length; i++) {
                let armourData = playerData["Armour"][armourNames[i]]
                let armourAmount = playerData.statEval(armourData["Amount"])
                let dexBonus = playerData["Stats"]["Dex"].modifier()
                if (armourData["Cap"] !== -1) {
                    if (dexBonus > armourData["Cap"]) {
                        dexBonus = armourData["Cap"]
                    }
                }
                armourAmount += dexBonus
                armourNamesWithStats.push(`${armourNames[i]} [${armourAmount}]`)
            }
            let armourChoice = actionParent.createSelect(armourNamesWithStats, armourNames)
            armourLabel.textContent = "Select Armour: "
            armourChoice.id = "armourChoice"
            armourLabel.htmlFor = "armourChoice"
            armourChoice.addEventListener("change", async function() {
                let oldData = localStorage.get("Characters")
                oldData[getQuery("Char")]["EquipArmour"] = this.value
                localStorage.set("Characters", oldData)
                await render(await developData())
            })
            armourChoice.value = playerData["EquipArmour"]
        } else if (selectedAction === "feat") {
            let featureParent = document.createElement("div")
            featureParent.classList.add("featureParent")
            actionParent.appendChild(featureParent)
            Object.entries(playerData["Features"]).forEach(([sourceKey, sourceValue]) => {
                let featureTitle = document.createElement("h2")
                featureTitle.textContent = sourceKey
                featureParent.appendChild(featureTitle)
                Object.entries(sourceValue).forEach(([itemKey, itemValue]) => {
                    let itemTitle = document.createElement("h4")
                    itemTitle.textContent = itemKey
                    featureParent.appendChild(itemTitle)
                    let itemText = document.createElement("p")
                    itemText.textContent = itemValue
                    featureParent.appendChild(itemText)
                })
            })
        }
    }

    await renderAction()

}

await render(await developData(), true)