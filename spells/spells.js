import spellData from "./spells.json" with { type: "json" }
import {id, numSuffix} from "../script.js"

console.log(spellData)

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

    let school = document.createElement("h3")
    if (spellPacket["Level"] === 0) {
        school.textContent = spellPacket["School"] + " Cantrip"
    } else {
        school.textContent = numSuffix(String(spellPacket["Level"])) +
    }
}

id("searchButton").addEventListener("click", function() {filter()});
id("searchSpell").addEventListener("keydown", function(event) {if (event.key === "Enter") {filter()}})
id("searchSpell").addEventListener("blur", function() {filter()});
filter()

if (location.getQuery("spell")) {
    renderSpell()
}