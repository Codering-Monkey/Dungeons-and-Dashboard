import {id, popup, setQuery} from "../script.js"
import classes from "../Data/classes.json" with { type: "json" }
import species from "../Data/species.json" with { type: "json" }
import backgrounds from "../Data/backgrounds.json" with { type: "json" }

let allStats = {
    "Strength": "Str",
    "Dexterity": "Dex",
    "Constitution": "Con",
    "Intelligence": "Int",
    "Wisdom": "Wis",
    "Charisma": "Cha",
}

HTMLInputElement.prototype.bonusEvent = function () {
    this.addEventListener("click", function() {
        let bonus = sessionStorage.get("Bonus")
        let other
        let increase
        other = id(String(Math.abs(this.value - 3)) + this.id.slice(1))
        increase = parseInt(this.value)
        let bonusItem = id("totalBonus")
        if (other.checked) {
            other.checked = false
            bonus[Math.abs(this.value - 3)].pull(this.id.slice(1))
            bonusItem.textContent = String(parseInt(bonusItem.textContent) - Math.abs(this.value - 3)) + " / 3"
        }
        if (this.checked) {
            bonusItem.textContent = String(parseInt(bonusItem.textContent) + increase) + " / 3"
            bonus[this.value].push(this.id.slice(1))
        } else {
            bonusItem.textContent = String(parseInt(bonusItem.textContent) - increase) + " / 3"
            bonus[this.value].pull(this.id.slice(1))
        }
        let flippedStats = allStats.invert()
        let availableAbilities = backgrounds[sessionStorage.get("Background")]["Abilities"]
        let availableBonus = 3 - parseInt(bonusItem.textContent)
        for (let i = 0; i < availableAbilities.length; i++) {
            for (let j = 1; j < 3; j++) {
                id(j + flippedStats[availableAbilities[i]]).disabled = availableBonus < j && (!id(j + flippedStats[availableAbilities[i]]).checked);
            }
        }
        sessionStorage.set("Bonus", bonus)
        updateTotal(this.id.slice(1))
    })
}

HTMLElement.prototype.collate = function (array) {
    Object.entries(array).forEach(([key, value]) => {
        let item = document.createElement("li")
        item.textContent = key + " x " + value
        this.appendChild(item)
    })
}

function updateTotal(catagory) {
    let number = parseInt(id("raw" + catagory).value)
    if (id("1" + catagory)) {
        if (id("1" + catagory).checked) {
            number += 1
        } else if (id("2" + catagory).checked) {
            number += 2
        }
    }
    let mod = Math.floor((number - 10) / 2)
    id("total" + catagory).textContent = String(number)
    id("mod" + catagory).textContent = mod.symbol()
}

let newCharacter = {
    "Current Health": 1000,
    "Max Health":0,
    "Temp Health": 0,
    "Level": 1,
    "Choices":{},
    "Prof": [],
    "Exp": [],
    "Resist": [],
    "Immune": [],
    "Weak": [],
    "Conditions": [],
    "Feats": [],
    "ArmourTraining": [],
    "WeaponTraining": [],
    "ToolTraining": [],
    "Languages": [],
}
let parent = id("parent")
let next = id("next")
let back = id("back")
next.addEventListener("click", function () {
    let stage = sessionStorage.get("createStage")
    if (stage === "Class") {
        if (sessionStorage.get("Class")) {
            newCharacter["Class"] = sessionStorage.get("Class")
            back.textContent = "Back"
            selectList(species, "Species")
        } else {
            popup("Please Select a Class")
        }
    } else if (stage === "Species") {
        if (sessionStorage.get("Species")) {
            newCharacter["Species"] = sessionStorage.get("Species")
            selectList(backgrounds, "Background")
        } else {
            popup("Please Select a Species")
        }
    } else if (stage === "Background") {
        if (sessionStorage.get("Background")) {
            newCharacter["Background"] = sessionStorage.get("Background")
            selectStats()
        } else {
            popup("Please Select a Background")
        }
    } else if (stage === "Stats") {
        if (id("totalPoints").textContent === "27 / 27" && id("totalBonus").textContent === "3 / 3") {
            newCharacter["BaseStats"] = sessionStorage.get("baseStats")
            newCharacter["Bonus"] = sessionStorage.get("Bonus")
            selectEquip()
        } else {
            popup("Please ensure you have 27 points & 3 bonus points allocated")
        }
    } else if (stage === "Equip") {
        if (sessionStorage.get("BackEquip") && sessionStorage.get("ClassEquip")) {
            next.textContent = "Finish"
            selectName()
        } else {
            popup("Please select both Background & Class Equipment")
        }
    } else if (stage === "Name") {
        if (sessionStorage.get("Name")) {
            newCharacter["Name"] = sessionStorage.get("Name")
            newCharacter["Gender"] = sessionStorage.get("Gender")
            newCharacter["Equipment"] = classes[sessionStorage.get("Class")]["Equipment"][sessionStorage.get("ClassEquip")]
            newCharacter["Size"] = id("Size").value
            Object.entries(backgrounds[sessionStorage.get("Background")]["Equipment"][sessionStorage.get("BackEquip")]).forEach(([key, value]) => {
                newCharacter["Equipment"][key] = (newCharacter["Equipment"][key] || 0) + value
            })
            localStorage.push("Characters", newCharacter)
            sessionStorage.wipe("Class", "Species", "Background", "baseStats", "Equip", "Name", "Gender", "Bonus", "ClassEquip", "BackEquip")
            window.location.href = "player.html?Char=" + (localStorage.get("Characters").length - 1)
        } else {
            popup("Please choose a Name")
        }
    }
})
back.addEventListener("click", function () {
    let stage = sessionStorage.get("createStage")
    if (stage === "Class") {
        newCharacter["Class"] = sessionStorage.get("Class")
        window.location.href = "all_characters.html"
    } else if (stage === "Species") {
        newCharacter["Species"] = sessionStorage.get("Species")
        back.textContent = "Leave"
        selectList(classes, "Class")
    } else if (stage === "Background") {
        newCharacter["Background"] = sessionStorage.get("Background")
        selectList(species, "Species")
    } else if (stage === "Stats") {
        newCharacter["BaseStats"] = sessionStorage.get("baseStats")
        newCharacter["Bonus"] = sessionStorage.get("Bonus")
        selectList(backgrounds, "Background")
    } else if (stage === "Equip") {
        selectStats()
    } else if (stage === "Name") {
        next.textContent = "Next"
        selectEquip()
    }
})

function selectList(data, storageKey) {
    parent.clear()
    parent.className = "listParent"
    sessionStorage.set("createStage", storageKey)
    Object.keys(data).forEach((key) => {
        let listItem = parent.createElement("div")
        listItem.id = key
        let shownDataElements = 0
        listItem.addEventListener("click", function () {
            if (sessionStorage.get(storageKey)) {
                id(sessionStorage.get(storageKey)).classList.remove("active")
                id(sessionStorage.get(storageKey)).style.height = "2.05em"
            }
            this.classList.add("active")
            this.style.height = `${2.38 + (2.4 * shownDataElements)}em`
            sessionStorage.set(storageKey, key)
        })
        listItem.addEventListener("dblclick", function () {
            sessionStorage.set(storageKey, key)
            next.click()
        })
        let listName = listItem.createElement("h2")
        listName.textContent = key
        let listData = listItem.createElement("div")
        if (storageKey === "Class") {
            shownDataElements = 4
            listData.createElement("p").textContent = `Primary Ability: ${classes[key]["Ability"].commaFuse()}`
            listData.createElement("p").textContent = `Hit Dice: d${classes[key]["Dice"]}`
            listData.createElement("p").textContent = `Saves: ${classes[key]["Saves"].commaFuse()}`
            listData.createElement("p").textContent = `Proficiencies: ${classes[key]["Prof"][0]["Amount"]}${classes[key]["Prof"][0]["Choices"] ? " from " + classes[key]["Prof"][0]["Choices"].commaFuse() : " skill proficiencies"}`
        } else if (storageKey === "Species") {
            shownDataElements = 3
            listData.createElement("p").textContent = `Speed: ${species[key]["Speed"]}ft`
            listData.createElement("p").textContent = `Size: ${species[key]["Size"].length > 1 ? species[key]["Size"].join(" or ") : species[key]["Size"][0] }`
            listData.createElement("p").textContent = `Type: ${species[key]["Type"]}`
        } else if (storageKey === "Background") {
            shownDataElements = 4
            listData.createElement("p").textContent = `Abilities: ${backgrounds[key]["Abilities"].commaFuse()}`
            listData.createElement("p").textContent = `Feat: ${backgrounds[key]["Feat"]}`
            listData.createElement("p").textContent = `Tool Proficiency: ${((backgrounds[key]["Prof"][0]["Choices"] || [null])[0] || backgrounds[key]["Prof"][0]["Catagory"])}`
            listData.createElement("p").textContent = `Skill Proficiencies: ${backgrounds[key]["Prof"][1]["Choices"].join(", ")}`
        }
        if (sessionStorage.get(storageKey) === key) {
            listItem.classList.add("active")
            listItem.style.height = `${2.38 + (2.4 * shownDataElements)}em`
        }
    })
}

function selectStats() {
    parent.clear()
    parent.className = "statParent"
    sessionStorage.set("createStage", "Stats")
    if (!sessionStorage.get("Bonus")) {
        sessionStorage.set("Bonus", {1:[], 2:[]})
    }
    if (!sessionStorage.get("baseStats")) {
        sessionStorage.set("baseStats", {
            "Strength": 8,
            "Dexterity": 8,
            "Constitution": 8,
            "Intelligence": 8,
            "Wisdom": 8,
            "Charisma": 8,
        })
    }

    let headers = [
        "Name",
        "Base",
        "Point Cost",
        "+1 Bonus",
        "+2 Bonus",
        "Total",
        "Modifier"
    ]
    for (let i = 0; i < headers.length; i++) {
        let headerItem = document.createElement("div")
        headerItem.textContent = headers[i]
        headerItem.classList.add("header")
        parent.appendChild(headerItem)
    }

    const statsToPoints = {
        "8": 0,
        "9": 1,
        "10": 2,
        "11": 3,
        "12": 4,
        "13": 5,
        "14": 7,
        "15": 9,
    }

    Object.entries(allStats).forEach(([key, value]) => {
        let name = document.createElement("div")
        name.textContent = key
        parent.appendChild(name)

        let raw = document.createElement("input")
        raw.type = "number"
        raw.id = "raw" + key
        raw.max = "15"
        raw.value = String(sessionStorage.get("baseStats")[key])
        raw.min = "8"
        parent.appendChild(raw)
        raw.buttons()

        let cost = document.createElement("div")
        cost.textContent = "0"
        cost.id = "cost" + key
        parent.appendChild(cost)

        raw.addEventListener("change", function() {
            cost.textContent = String(statsToPoints[raw.value])
            let totalCost = 0
            Object.keys(allStats).forEach((statKey) => {
                totalCost += parseInt(id("cost" + statKey).textContent)
            })
            if (totalCost > 27) {
                popup("You cannot have a Point Buy total greater than 27!")
            }
            while (totalCost > 27) {
                totalCost -= statsToPoints[this.value]
                this.value = String(parseInt(this.value) - 1)
                totalCost += statsToPoints[this.value]
            }
            cost.textContent = String(statsToPoints[raw.value])
            id("totalPoints").textContent = String(totalCost) + " / 27"
            sessionStorage.indexSet("baseStats", this.id.slice(3), parseInt(this.value))
            updateTotal(key)
        })

        if (backgrounds[sessionStorage.get("Background")]["Abilities"].includes(value)) {
            let one  = document.createElement("input")
            one.type = "checkbox"
            one.id = "1" + key
            one.value = "1"
            if (sessionStorage.get("Bonus")[1].includes(key)) {
                one.checked = true
            }
            one.bonusEvent()
            parent.appendChild(one)
            let two  = document.createElement("input")
            two.type = "checkbox"
            two.id = "2" + key
            two.value = "2"
            if (sessionStorage.get("Bonus")[2].includes(key)) {
                two.checked = true
            }
            two.bonusEvent()
            parent.appendChild(two)
        } else {
            parent.blank(2)
        }

        let total = document.createElement("div")
        total.textContent = "0"
        total.id = "total" + key
        parent.appendChild(total)

        let mod = document.createElement("div")
        mod.textContent = "0"
        mod.id = "mod" + key
        parent.appendChild(mod)

        updateTotal(key)
    })

    let totalTitle = document.createElement("div")
    totalTitle.classList.add("header")
    totalTitle.textContent = "Total"
    parent.appendChild(totalTitle)
    parent.blank()
    let totalPoints = document.createElement("div")
    totalPoints.classList.add("header")
    totalPoints.id = "totalPoints"
    parent.appendChild(totalPoints)
    let totalCost = 0
    Object.keys(allStats).forEach((statKey) => {
        let pointValue = statsToPoints[id("raw" + statKey).value]
        id("cost" + statKey).textContent = String(pointValue)
        totalCost += parseInt(pointValue)
    })
    totalPoints.textContent = String(totalCost) + " / 27"
    let totalBonus = document.createElement("div")
    totalBonus.classList.add("header")
    totalBonus.id = "totalBonus"
    totalBonus.textContent = String(sessionStorage.get("Bonus")[1].length + (sessionStorage.get("Bonus")[2].length * 2)) + " / 3"
    totalBonus.style.gridColumn = "span 2"
    parent.appendChild(totalBonus)
    parent.blank(2)
}

function selectEquip() {
    parent.clear()
    parent.className = "equipParent"
    sessionStorage.set("createStage", "Equip")

    let backgroundData = backgrounds[sessionStorage.get("Background")]["Equipment"]
    let classData = classes[sessionStorage.get("Class")]["Equipment"]
    let height = Math.max(backgroundData.length, classData.length)
    parent.style.setProperty("--height", height)

    let boxes = {}

    function loadEquip(title, dataSet, shorthand) {
        parent.createElement("div", "header").textContent = title
        boxes[shorthand] = []
        for (let i = 0; i < height; i++) {
            if (i < dataSet.length) {
                let equipElement = parent.createElement("ul")
                equipElement.collate(dataSet[i])
                if (sessionStorage.get(shorthand) && sessionStorage.get(shorthand) === String(i)) {
                    equipElement.classList.add("active")
                }
                boxes[shorthand].push(equipElement)
                equipElement.addEventListener("click", function () {
                    for (let j = 0; j < boxes[shorthand].length; j++) {
                        boxes[shorthand][j].classList.remove("active")
                    }
                    this.classList.add("active")
                    sessionStorage.set(shorthand, String(i))
                })
            } else {
                parent.createElement("div", )
            }
        }
    }

    loadEquip("Background Equipment", backgroundData, "BackEquip")
    loadEquip("Class Equipment", classData, "ClassEquip")
}

function selectName() {
    parent.clear()
    parent.className = "nameParent"
    sessionStorage.set("createStage", "Name")

    let name = document.createElement("input")
    name.type = "text"
    name.addEventListener("change", function() {
        sessionStorage.set("Name", name.value)
    })
    if (sessionStorage.get("Name")) {
        name.value = sessionStorage.get("Name")
    }
    parent.appendChild(name)
    parent.break(1)
    let randomise = document.createElement("button")
    randomise.textContent = "Randomise Name"
    parent.appendChild(randomise)
    randomise.addEventListener("click", async function() {
        let gender = sessionStorage.get("Gender") ? sessionStorage.get("Gender").toLowerCase() : "m"
        let nameSet = species[sessionStorage.get("Species")]["NameSet"] ? species[sessionStorage.get("Species")]["NameSet"] : "h"
        this.textContent = "Loading..."
        name.value = await fetch(`https://fantasyname.lukewh.com/?family=t&ancestry=${nameSet}&gender=${gender}`, {
            method: "GET",
            }
        ).then((response) => response.text())
        this.textContent = "Randomise Name"
        sessionStorage.set("Name", name.value)
    })

    parent.break(1)
    sessionStorage.set("Gender", "M")

    let maleParent = document.createElement("div")
    let male = document.createElement("input")
    male.type = "checkbox"
    if (sessionStorage.get("Gender") === "M") {
        male.checked = true
    }
    maleParent.appendChild(male)
    let maleText = document.createElement("p")
    maleText.textContent = "M"
    maleParent.appendChild(maleText)
    parent.appendChild(maleParent)

    let femaleParent = document.createElement("div")
    femaleParent.style.marginLeft = "-4px"
    let female = document.createElement("input")
    female.type = "checkbox"
    if (sessionStorage.get("Gender") === "F") {
        female.checked = true
    }
    femaleParent.appendChild(female)
    let femaleText = document.createElement("p")
    femaleText.textContent = "F"
    femaleParent.appendChild(femaleText)
    parent.appendChild(femaleParent)

    maleText.addEventListener("click", function() {
        male.click()
        female.checked = false
        sessionStorage.set("Gender", "M")
    })
    femaleText.addEventListener("click", function() {
        female.click()
        male.checked = false
        sessionStorage.set("Gender", "F")
    })

    parent.break(2)
    let charData = document.createElement("div")
    const dataSources = ["Class", "Species", "Background"]
    for (let i = 0; i < dataSources.length; i++) {
        let dataItem = document.createElement("p")
        dataItem.textContent = `${dataSources[i]}: ${sessionStorage.get(dataSources[i])}`
        charData.appendChild(dataItem)
    }
    parent.appendChild(charData)

    let sizeLabel = charData.createElement("label")
    sizeLabel.textContent = "Size: "
    charData.createSelect(species[sessionStorage.get("Species")]["Size"]).style.fontSize = "1em"
}

selectList(classes, "Class")
