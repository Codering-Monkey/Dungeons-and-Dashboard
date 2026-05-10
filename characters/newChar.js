import {id, popup} from "../script.js"
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
    for (let i = 0; i < array.length; i++) {
        let item = document.createElement("li")
        item.textContent = array[i][1] + "x " + array[i][0]
        this.appendChild(item)
    }
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

let newCharacter = {}
let parent = id("parent")
let next = id("next")
next.addEventListener("click", function () {
    let stage = sessionStorage.get("createStage")
    if (stage === "Class") {
        newCharacter["Class"] = sessionStorage.get("Class")
        selectList(species, "Species")
    } else if (stage === "Species") {
        newCharacter["Species"] = sessionStorage.get("Species")
        selectList(backgrounds, "Background")
    } else if (stage === "Background") {
        selectStats()
    } else if (stage === "Stats") {
        selectEquip()
    }
})
let back = id("back")
back.addEventListener("click", function () {
    let stage = sessionStorage.get("createStage")
    if (stage === "Species") {
        newCharacter["Species"] = sessionStorage.get("Species")
        selectList(classes, "Class")
    } else if (stage === "Background") {
        newCharacter["Background"] = sessionStorage.get("Background")
        selectList(species, "Species")
    } else if (stage === "Stats") {
        selectList(backgrounds, "Background")
    } else if (stage === "Equip") {
        selectStats()
    }
})

function selectList(data, storageKey) {
    parent.clear()
    parent.className = "listParent"
    sessionStorage.set("createStage", storageKey)
    if (!sessionStorage.get(storageKey)) {
        sessionStorage.set(storageKey, "parent")
    }
    Object.keys(data).forEach((key) => {
        let listItem = document.createElement("div")
        listItem.id = key
        listItem.addEventListener("click", function () {
            id(sessionStorage.get(storageKey)).classList.remove("active")
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

    Object.entries(allStats).forEach(([key, value]) => {
        let name = document.createElement("div")
        name.textContent = key
        parent.appendChild(name)

        let raw = document.createElement("input")
        raw.type = "number"
        raw.id = "raw" + key
        raw.max = "15"
        raw.value = "8"
        raw.min = "8"
        parent.appendChild(raw)
        raw.buttons()

        let cost = document.createElement("div")
        cost.textContent = "0"
        cost.id = "cost" + key
        parent.appendChild(cost)

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
            one.bonusEvent()
            parent.appendChild(one)
            let two  = document.createElement("input")
            two.type = "checkbox"
            two.id = "2" + key
            two.value = "2"
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
    totalPoints.textContent = "0"
    parent.appendChild(totalPoints)
    let totalBonus = document.createElement("div")
    totalBonus.classList.add("header")
    totalBonus.id = "totalBonus"
    totalBonus.textContent = "0"
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

    let optionAClass = document.createElement("ul")
    optionAClass.collate(classes[sessionStorage.get("Class")]["Equipment"][0])
    let optionBClass = document.createElement("ul")
    optionBClass.collate(classes[sessionStorage.get("Class")]["Equipment"][1])

    parent.appendChild(optionABack)
    parent.appendChild(optionAClass)
    parent.appendChild(optionBBack)
    parent.appendChild(optionBClass)

    optionABack.addEventListener("click", function() {
        optionBBack.classList.remove("active")
        optionABack.classList.add("active")
        sessionStorage.set("BackEquip", "A")
    })
    optionBBack.addEventListener("click", function() {
        optionABack.classList.remove("active")
        optionBBack.classList.add("active")
        sessionStorage.set("BackEquip", "B")
    })
    optionAClass.addEventListener("click", function() {
        optionBClass.classList.remove("active")
        optionAClass.classList.add("active")
        sessionStorage.set("ClassEquip", "A")
    })
    optionBClass.addEventListener("click", function() {
        optionAClass.classList.remove("active")
        optionBClass.classList.add("active")
        sessionStorage.set("ClassEquip", "B")
    })
}

selectList(classes, "Class")
// localStorage.push("Characters", newCharacter)