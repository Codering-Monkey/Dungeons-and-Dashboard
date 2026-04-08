import spellData from "./spells.json" with { type: "json" }
import {id, numSuffix, setQuery, getQuery} from "../script.js"

// ?search={str}&source={str},{str}&minLevel={int}&maxLevel={int}&school={str},{str}&class={str},{str}

function filterSpells() {
    let filterQuery = true
    let filterSource = true
    let filterSchool = true
    let filterClass = true
    let filterLevel = true

    let query
    let sources
    let schools
    let classes
    let minLevel
    let maxLevel

    try {
        query = id("searchSpell").value.toLowerCase();
        setQuery("search", query)
    } catch {
        filterQuery = false
    }
    try {
        sources = getQuery("source").toLowerCase().split(",")
    } catch {
        filterSource = false
    }
    try {
        schools = getQuery("school").toLowerCase().split(",")
    } catch {
        filterSchool = false
    }
    try {
        classes = getQuery("class").toLowerCase().split(",")
    } catch {
        filterClass = false
    }
    try {
        minLevel = getQuery("minLevel")
        if (!minLevel) {
            minLevel = 0
        }
        maxLevel = getQuery("maxLevel")
        if (!maxLevel) {
            maxLevel = 0
        }
    } catch {
        filterLevel = false
    }
    let filteredData = structuredClone(spellData)
    Object.entries(filteredData).forEach(([spellName, spellData]) => {
        if (filterQuery) {
            if (!spellName.toLowerCase().includes(query)) {
                delete filteredData[spellName];
                return
            }
        }
        if (filterSource) {
            if (!sources.includes(spellData["Source"].toLowerCase())) {
                delete filteredData[spellName];
                return
            }
        }
        if (filterLevel) {
            if (!(minLevel <= spellData["Level"] <= maxLevel)) {
                delete filteredData[spellName];
                return
            }
        }
        if (filterSchool) {
            if (!schools.includes(spellData["School"].toLowerCase())) {
                delete filteredData[spellName];
                return
            }
        }
        if (filterClass) {
            let validClass = false
            for (let i = 0; i < spellData["Classes"]; i++) {
                if (classes.includes(spellData["Classes"][i].toLowerCase())) {
                    validClass = true
                }
            }
            if (!validClass) {
                delete filteredData[spellName];
            }
        }
    })

    let parent = id("spellParent")
    parent.clear()
    Object.entries(filteredData).forEach(([spellName, spellData]) => {
        let container = document.createElement("div")
        container.classList.add("spellOption")
        parent.append(container)
        container.addEventListener("click", function() {setQuery("spell", spellName)})

        let level = document.createElement("span")
        level.textContent = spellData["Level"]
        container.appendChild(level)

        let name = document.createElement("span")
        name.textContent = spellData["Name"]
        container.appendChild(name)

        let school = document.createElement("span")
        school.textContent = spellData["School"]
        container.appendChild(school)
    })
}

function renderSpell() {
    let spellPacket = spellData[getQuery("spell")]
    let parent = id("spellData")

    let title = document.createElement("h1")
    title.textContent = spellPacket["Name"]
    parent.append(title)

    let school = document.createElement("h2")
    if (spellPacket["Level"] === 0) {
        school.textContent = spellPacket["School"] + " Cantrip"
    } else {
        school.textContent = numSuffix(spellPacket["Level"]) + " Level " + spellPacket["School"]
    }
    parent.append(school)

    let source = document.createElement("h3")
    let group
    if (["Player's Handbook"].includes(spellPacket["Source"])) {
        group = " (Core Rules)"
    } else if (["Xanathar's Guide to Everything", "Tasha's Cauldron of Everything", "Xanathar's Guide to Everything/Elemental Evil Player's Companion", "Tasha's Cauldron of Everything/Sword Coast Adventurer's Guide"].includes(spellPacket["Source"])) {
        group = " (Expanded Rules)"
    } else if (["Fizban's Treasury of Dragons", 'The Book of Many Things'].includes(spellPacket["Source"])) {
        group = " (Extended Rules)"
    } else if (['Strixhaven: A Curriculum of Chaos', 'Icewind Dale - Rime of the Frostmaiden', 'Lost Laboratory of Kwalish', "Explorer's Guide to Wildemount", "Guildmaster's Guide to Ravnica", 'Acquisitions Inc.'].includes(spellPacket["Source"])) {
        group = " (Campaign Rules)"
    } else if (['Planescape - Adventures in the Multiverse', "Spelljammer: Adventures in Space - Astral Adventurer's Guide"].includes(spellPacket["Source"])) {
        group = " (Space Rules)"
    } else {
        group = " (Other Rules)"
    }
    source.innerHTML = "<strong>Source: </strong>" + spellPacket["Source"] + group
    parent.append(source)

    let classes = document.createElement("h3")
    classes.innerHTML = "<strong>Classes: </strong>" + spellPacket["Classes"].fuse(", ")
    parent.appendChild(classes)

    let castTime = document.createElement("h4")
    castTime.innerHTML = "<strong>Casting Time: </strong>" + spellPacket["Casting Time"]
    parent.appendChild(castTime)

    let range = document.createElement("h4")
    range.innerHTML = "<strong>Range: </strong>" + spellPacket["Range"]
    parent.appendChild(range)

    let components = document.createElement("h4")
    components.innerHTML = "<strong>Components: </strong>" + spellPacket["Components"].fuse(", ")
    parent.appendChild(components)

    let duration = document.createElement("h4")
    duration.innerHTML = "<strong>Duration: </strong>" + spellPacket["Duration"]
    parent.appendChild(duration)

    let description = document.createElement("p")
    description.innerHTML = spellPacket["Description"].parse()
    parent.appendChild(description)

    if ("Extra" in spellPacket) {
        Object.entries(spellPacket["Extra"]).forEach(([key, value]) => {
            let string = document.createElement("p")
            string.innerHTML = `<strong>${key}:</strong> ${value}`
            parent.appendChild(string)
        })
    }

    if ("Increase" in spellPacket) {
        let increase = document.createElement("h4")
        let prefix
        if (spellPacket["Level"] === 0) {
            prefix = "<strong>At Higher Levels: </strong>"
        } else {
            prefix = "<strong>Using a Higher Level Spell Slot: </strong>"
        }
        increase.innerHTML = prefix + spellPacket["Increase"].parse()
        parent.appendChild(increase)
    }
}

function filter() {

}

id("searchButton").addEventListener("click", function() {filterSpells()});
id("searchSpell").addEventListener("keydown", function(event) {if (event.key === "Enter") {filterSpells()}})
id("searchSpell").addEventListener("blur", function() {filterSpells()});
filter()

id("searchSpell").value = getQuery("search")

if (getQuery("spell")) {
    renderSpell()
}