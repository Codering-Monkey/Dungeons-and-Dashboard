import spellData from "./spells.json" with { type: "json" }
import {id, numSuffix, setQuery, getQuery} from "../script.js"


function filter() {
    const query = id("searchSpell").value.toLowerCase();
    let filteredData = structuredClone(spellData)
    Object.entries(filteredData).forEach(([spellName, spellData]) => {
        if (!spellName.toLowerCase().includes(query)) {
            delete filteredData[spellName];
            return
        }
    })

    let parent = id("spellParent")
    parent.clear()
    Object.entries(filteredData).forEach(([spellName, spellData]) => {
        let container = document.createElement("div")
        container.classList.add("spellOption")
        parent.append(container)
        container.addEventListener("click", function() {location.setQuery("spell", spellName)})

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
    let spellPacket = spellData[location.getQuery("spell")]
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
    if (spellPacket["Source"] in ["Player's Handbook"]) {
        group = " (Core Rules)"
    } else if (spellPacket["Source"] in ["Xanathar's Guide to Everything", "Tasha's Cauldron of Everything", "Xanathar's Guide to Everything/Elemental Evil Player's Companion", "Tasha's Cauldron of Everything/Sword Coast Adventurer's Guide"]) {
        group = " (Expanded Rules)"
    } else if (spellPacket["Source"] in ["Fizban's Treasury of Dragons", 'The Book of Many Things']) {
        group = " (Extended Rules)"
    } else if (spellPacket["Source"] in ['Strixhaven: A Curriculum of Chaos', 'Icewind Dale - Rime of the Frostmaiden', 'Lost Laboratory of Kwalish', "Explorer's Guide to Wildemount", "Guildmaster's Guide to Ravnica", 'Acquisitions Inc.']) {
        group = " (Campaign Rules)"
    } else if (spellPacket["Source"] in ['Planescape - Adventures in the Multiverse', "Spelljammer: Adventures in Space - Astral Adventurer's Guide"]) {
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

id("searchButton").addEventListener("click", function() {filter()});
id("searchSpell").addEventListener("keydown", function(event) {if (event.key === "Enter") {filter()}})
id("searchSpell").addEventListener("blur", function() {filter()});
filter()

if (location.getQuery("spell")) {
    renderSpell()
}