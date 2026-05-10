import {id, popup, setQuery} from "../script.js"
import classes from "./classes.json" with { type: "json" }
import species from "./species.json" with { type: "json" }
import backgrounds from "./backgrounds.json" with { type: "json" }

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
            bonusItem.textContent = String(parseInt(bonusItem.textContent) - Math.abs(this.value - 3))
        }
        if (this.checked) {
            bonusItem.textContent = String(parseInt(bonusItem.textContent) + increase)
            bonus[this.value].push(this.id.slice(1))
        } else {
            bonusItem.textContent = String(parseInt(bonusItem.textContent) - increase)
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

let newCharacter = {"Choices":{}}
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
        if (id("totalPoints").textContent === "27" && id("totalBonus").textContent === "3") {
            newCharacter["Stats"] = sessionStorage.get("baseStats")
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
        newCharacter["Stats"] = sessionStorage.get("baseStats")
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
        let listItem = document.createElement("div")
        listItem.id = key
        listItem.addEventListener("click", function () {
            if (sessionStorage.get(storageKey)) {
                id(sessionStorage.get(storageKey)).classList.remove("active")
            }
            this.classList.add("active")
            sessionStorage.set(storageKey, key)
        })
        parent.appendChild(listItem)
        if (sessionStorage.get(storageKey) === key) {
            listItem.classList.add("active")
        }
        let listName = document.createElement("h2")
        listName.textContent = key
        listItem.appendChild(listName)
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
            id("totalPoints").textContent = String(totalCost)
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
    totalPoints.textContent = String(totalCost)
    let totalBonus = document.createElement("div")
    totalBonus.classList.add("header")
    totalBonus.id = "totalBonus"
    totalBonus.textContent = String(sessionStorage.get("Bonus")[1].length + sessionStorage.get("Bonus")[2].length);
    totalBonus.style.gridColumn = "span 2"
    parent.appendChild(totalBonus)
    parent.blank(2)
}

function selectEquip() {
    parent.clear()
    parent.className = "equipParent"
    sessionStorage.set("createStage", "Equip")

    let optionATitle = document.createElement("div")
    optionATitle.classList.add("header")
    optionATitle.textContent = "Background Equipment"
    parent.appendChild(optionATitle)
    let optionBTitle = document.createElement("div")
    optionBTitle.classList.add("header")
    optionBTitle.textContent = "Class Equipment"
    parent.appendChild(optionBTitle)

    let optionABack = document.createElement("ul")
    optionABack.collate(backgrounds[sessionStorage.get("Background")]["Equipment"][0])
    let optionBBack = document.createElement("ul")
    optionBBack.collate(backgrounds[sessionStorage.get("Background")]["Equipment"][1])
    let backEquip = sessionStorage.get("BackEquip")
    if (backEquip) {
        if (backEquip === "0") {
            optionABack.classList.add("active")
        } else if (backEquip === "1") {
            optionBBack.classList.add("active")
        }
    }

    let optionAClass = document.createElement("ul")
    optionAClass.collate(classes[sessionStorage.get("Class")]["Equipment"][0])
    let optionBClass = document.createElement("ul")
    optionBClass.collate(classes[sessionStorage.get("Class")]["Equipment"][1])
    let classEquip = sessionStorage.get("ClassEquip")
    if (classEquip) {
        if (classEquip === "0") {
            optionAClass.classList.add("active")
        } else if (classEquip === "1") {
            optionBClass.classList.add("active")
        }
    }

    parent.appendChild(optionABack)
    parent.appendChild(optionAClass)
    parent.appendChild(optionBBack)
    parent.appendChild(optionBClass)

    optionABack.addEventListener("click", function() {
        optionBBack.classList.remove("active")
        optionABack.classList.add("active")
        sessionStorage.set("BackEquip", "0")
    })
    optionBBack.addEventListener("click", function() {
        optionABack.classList.remove("active")
        optionBBack.classList.add("active")
        sessionStorage.set("BackEquip", "1")
    })
    optionAClass.addEventListener("click", function() {
        optionBClass.classList.remove("active")
        optionAClass.classList.add("active")
        sessionStorage.set("ClassEquip", "0")
    })
    optionBClass.addEventListener("click", function() {
        optionAClass.classList.remove("active")
        optionBClass.classList.add("active")
        sessionStorage.set("ClassEquip", "1")
    })
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
        let gender = sessionStorage.get("Gender") ? sessionStorage.get("Species").toLowerCase() : "m"
        let nameSet = species[sessionStorage.get("Species")]["NameSet"] ? species[sessionStorage.get("Species")]["NameSet"] : "h"
        name.value = await fetch(`https://fantasyname.lukewh.com/?family=t&ancestry=${nameSet}&gender=${gender}`, {
            method: "GET",
            }
        ).then((response) => response.text())
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
}

selectList(classes, "Class")
