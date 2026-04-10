import spellData from "./spells.json" with { type: "json" }
import {id, numSuffix, setQuery, getQuery} from "../script.js"

// ?search={str}&source={str},{str}&minLevel={int}&maxLevel={int}&school={str},{str}&class={str},{str}
// ?class=wizard&minLevel=0&maxLevel=1

let spellStats = {
    "source": {},
    "school": {},
    "level": {},
    "classes": {}
}
Object.entries(spellData).forEach(([spellName, spellInfo]) => {
    spellStats["source"][spellInfo["Source"]] = (spellStats["source"][spellInfo["Source"]] || 0) + 1
    spellStats["school"][spellInfo["School"].split()[0]] = (spellStats["school"][spellInfo["School"].split()[0]] || 0) + 1
    spellStats["level"][spellInfo["Level"]] = (spellStats["level"][spellInfo["Level"]] || 0) + 1
    for (let i = 0; i < spellInfo["Classes"].length; i++) {
        spellStats["classes"][spellInfo["Classes"][i]] = (spellStats["classes"][spellInfo["Classes"][i]] || 0) + 1
    }
})

/**
 * @param {string} query
 * @param {string[]} sources
 * @param {string[]} schools
 * @param {string[]} classes
 * @param {number} minLevel
 * @param {number} maxLevel
 */
function filterSpells(query, sources, schools, classes, minLevel=0, maxLevel=9) {
    let filteredData = structuredClone(spellData)
    Object.entries(filteredData).forEach(([spellName, spellInfo]) => {
        if (query) {
            if (!spellName.toLowerCase().includes(query)) {
                delete filteredData[spellName];
                return
            }
        }
        if (sources) {
            if (!sources.includes(spellInfo["Source"].toLowerCase())) {
                delete filteredData[spellName];
                return
            }
        }
        if (!((minLevel <= spellInfo["Level"]) && (spellInfo["Level"] <= maxLevel))) {
            delete filteredData[spellName];
            return
        }
        if (schools) {
            if (!schools.includes(spellInfo["School"].toLowerCase())) {
                delete filteredData[spellName];
                return
            }
        }
        if (classes) {
            let validClass = false
            for (let i = 0; i < spellInfo["Classes"].length; i++) {
                if (classes.includes(spellInfo["Classes"][i].toLowerCase())) {
                    validClass = true
                }
            }
            if (!validClass) {
                delete filteredData[spellName];
            }
        }
    })
    return filteredData
}

function renderSpells() {
    let filteredData = filterSpells(
        getQuery("search") ? getQuery("search").toLowerCase() : null,
        getQuery("source") ? getQuery("source").toLowerCase().split(",") : null,
        getQuery("school") ? getQuery("school").toLowerCase().split(",") : null,
        getQuery("class") ? getQuery("class").toLowerCase().split(",") : null,
        getQuery("minLevel") ? parseInt(getQuery("minLevel")) : 0,
        getQuery("maxLevel") ? parseInt(getQuery("maxLevel")) : 9
        )
    let parent = id("spellParent")
    parent.clear()
    Object.entries(filteredData).forEach(([spellName, spellData]) => {
        let container = document.createElement("div")
        container.classList.add("spellOption")
        parent.append(container)
        container.addEventListener("click", function() {setQuery("spell", spellName); showSpell()})

        let level = document.createElement("span")
        level.textContent = spellData["Level"]
        container.appendChild(level)

        let name = document.createElement("span")
        name.textContent = spellName
        container.appendChild(name)

        let school = document.createElement("span")
        school.textContent = spellData["School"]
        container.appendChild(school)
    })
}

function showSpell() {
    let spellPacket = spellData[getQuery("spell")]
    let parent = id("spellData")
    parent.clear()

    let title = document.createElement("h1")
    title.textContent = getQuery("spell")
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
    let parent = id("spellData")
    parent.clear()
}

id("searchButton").addEventListener("click", function() {setQuery("search", id("searchSpell").value); renderSpells()});
id("searchSpell").addEventListener("keydown", function(event) {if (event.key === "Enter") {setQuery("search", id("searchSpell").value); renderSpells()}})
id("searchSpell").addEventListener("blur", function() {setQuery("search", id("searchSpell").value); renderSpells()});
id("filter").addEventListener("click", function() {
    if (this.textContent === "filter_alt") {
        filter()
        this.textContent = "close"
    } else {
        showSpell()
        this.textContent = "filter_alt"
    }
})

id("searchSpell").value = getQuery("search")

if (getQuery("spell")) {
    showSpell()
}
renderSpells()