import spellData from "./spells.json" with { type: "json" }
import {id, numSuffix, setQuery, getQuery} from "../script.js"

// ?search={str}&source={str},{str}&minLevel={int}&maxLevel={int}&school={str},{str}&class={str},{str}&desc={bool}&sort={level, name, school}

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
    let classString = spellInfo["Classes"].sort().fuse(",")
    spellStats["classes"][classString] = (spellStats["classes"][classString] || 0) + 1
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
    let sortKey = getQuery("sort") ? getQuery("sort") : "Level"
    let entries = Object.entries(filteredData)
    if (sortKey === "Name") {
        entries.sort((a, b) => a[0].localeCompare(b[0]))
    } else if (sortKey === "Level") {
        entries.sort((a, b) => a[1]["Level"] - b[1]["Level"])
    } else {
        entries.sort((a, b) => a[1]["School"].localeCompare(b[1]["School"]))
    }
    if (Boolean(getQuery("desc"))) {
        entries.reverse()
    }
    filteredData = Object.fromEntries(entries)
    let parent = id("spellParent")
    parent.clear()
    Object.entries(filteredData).forEach(([spellName, spellData]) => {
        let container = document.createElement("div")
        container.classList.add("spellOption")
        parent.append(container)
        container.addEventListener("click", function() {if (id("filter").textContent === "filter_alt") {setQuery("spell", spellName); showSpell()}})

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
    return Object.keys(filteredData).length
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
    if ("Extras" in spellPacket) {
        for (let i = 0; i < spellPacket["Extras"].length; i++) {
            school.textContent += " (" + spellPacket["Extras"][i] + ")"
        }
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
    let filteredSpells = 0
    parent.clear()
    let title = document.createElement("h1")
    title.textContent = "Filter Spells"
    parent.appendChild(title)
    let filteredAmount = document.createElement("h6")
    parent.appendChild(filteredAmount)
    function reFilter() {
        filteredAmount.textContent = "Filtered Spells: " + renderSpells()
    }

    let sourcesTitle = document.createElement("h2")
    sourcesTitle.textContent = "Sources"
    parent.appendChild(sourcesTitle)
    let sourcesAmount = document.createElement("h6")
    sourcesAmount.textContent = "Valid Spells: *"
    parent.appendChild(sourcesAmount)
    const sourcesArray = [
        "Xanathar's Guide to Everything",
        "Player's Handbook",
        "Spelljammer: Adventures in Space - Astral Adventurer's Guide",
        "Forgotten Realms - Heroes of Faerun",
        "The Book of Many Things",
        "Fizban's Treasury of Dragons",
        "Tasha's Cauldron of Everything",
        "Strixhaven: A Curriculum of Chaos",
        "Icewind Dale - Rime of the Frostmaiden",
        "Explorer's Guide to Wildemount",
        "Acquisitions Inc.",
        "Xanathar's Guide to Everything/Elemental Evil Player's Companion",
        "Guildmaster's Guide to Ravnica",
        "Lost Laboratory of Kwalish",
        "Planescape - Adventures in the Multiverse",
        "Tasha's Cauldron of Everything/Sword Coast Adventurer's Guide",
        "Eberron - Forge of the Artificer"
    ]
    let sourceRaw = document.createElement("div")
    let sourcesFiltered = getQuery("source") ? getQuery("source").toLowerCase().split(",") : []
    filteredSpells = 0
    for (let i = 0; i < sourcesFiltered.length; i++) {
        filteredSpells += spellStats["source"][sourcesFiltered[i]]
    }
    sourcesAmount.textContent = "Valid Spells: "+ filteredSpells
    for (let i = 0; i < sourcesArray.length; i++) {
        let sourceBox = document.createElement("input")
        sourceBox.type = "checkbox"
        sourceBox.id = sourcesArray[i]
        sourceBox.value = sourcesArray[i]
        if (sourcesFiltered.includes(sourcesArray[i].toLowerCase())) {
            sourceBox.checked = true
        }
        sourceBox.addEventListener("change", function () {
            let value = this.value.trim()
            if (this.checked) {
                sourcesFiltered.push(value)
            } else {
                sourcesFiltered.pull(value)
            }
            setQuery("source", sourcesFiltered.fuse(","))
            reFilter()
            let filteredSpells = 0
            for (let i = 0; i < sourcesFiltered.length; i++) {
                filteredSpells += spellStats["source"][sourcesFiltered[i]]
            }
            sourcesAmount.textContent = "Valid Spells: "+ filteredSpells
        })
        sourceRaw.appendChild(sourceBox)
        let sourceLabel = document.createElement("label")
        sourceLabel.textContent = sourcesArray[i]
        sourceLabel.htmlFor = sourcesArray[i]
        sourceRaw.appendChild(sourceLabel)
        sourceRaw.spacer()
    }
    parent.appendChild(sourceRaw)

    let schoolsTitle = document.createElement("h2")
    schoolsTitle.textContent = "Schools"
    parent.appendChild(schoolsTitle)
    let schoolsAmount = document.createElement("h6")
    schoolsAmount.textContent = "Valid Spells: *"
    parent.appendChild(schoolsAmount)
    const schoolsArray = [
        'Abjuration',
        'Conjuration',
        'Divination',
        'Enchantment',
        'Evocation',
        'Illusion',
        'Necromancy',
        'Transmutation'
    ]
    let schoolsRaw = document.createElement("div")
    let schoolsFiltered = getQuery("school") ? getQuery("school").toLowerCase().split(",") : []
    filteredSpells = 0
    for (let i = 0; i < schoolsFiltered.length; i++) {
        filteredSpells += spellStats["school"][schoolsFiltered[i]]
    }
    schoolsAmount.textContent = "Valid Spells: "+ filteredSpells
    for (let i = 0; i < schoolsArray.length; i++) {
        let schoolBox = document.createElement("input")
        schoolBox.type = "checkbox"
        schoolBox.id = schoolsArray[i]
        schoolBox.value = schoolsArray[i]
        if (schoolsFiltered.includes(schoolsArray[i].toLowerCase())) {
            schoolBox.checked = true
        }
        schoolBox.addEventListener("change", function () {
            let value = this.value.trim()
            if (this.checked) {
                schoolsFiltered.push(value)
            } else {
                schoolsFiltered.pull(value)
            }
            setQuery("school", schoolsFiltered.fuse(","))
            reFilter()
            let filteredSpells = 0
            for (let i = 0; i < schoolsFiltered.length; i++) {
                filteredSpells += spellStats["school"][schoolsFiltered[i]]
            }
            schoolsAmount.textContent = "Valid Spells: "+ filteredSpells
        })
        schoolsRaw.appendChild(schoolBox)
        let schoolLabel = document.createElement("label")
        schoolLabel.textContent = schoolsArray[i]
        schoolLabel.htmlFor = schoolsArray[i]
        schoolsRaw.appendChild(schoolLabel)
        schoolsRaw.spacer()
    }
    parent.appendChild(schoolsRaw)

    let classesTitle = document.createElement("h2")
    classesTitle.textContent = "Classes"
    parent.appendChild(classesTitle)
    let classesAmount = document.createElement("h6")
    classesAmount.textContent = "Valid Spells: *"
    parent.appendChild(classesAmount)
    const classesArray = [
        "Artificer",
        "Bard",
        "Cleric",
        "Druid",
        "Ranger",
        "Paladin",
        "Sorcerer",
        "Warlock",
        "Wizard"
    ]
    let classesRaw = document.createElement("div")
    let classesFiltered = getQuery("class") ? getQuery("class").toLowerCase().split(",") : []
    filteredSpells = 0
    let validKeys = []
    Object.keys(spellStats["classes"]).forEach(key => {
        for (let i = 0; i < classesFiltered.length; i++) {
            if (key.includes(classesFiltered[i])) {
                validKeys.push(key)
            }
        }
    })
    validKeys = Array.from(new Set(validKeys))
    for (let i = 0; i < validKeys.length; i++) {
        filteredSpells += spellStats["classes"][validKeys[i]]
    }
    classesAmount.textContent = "Valid Spells: " + filteredSpells
    for (let i = 0; i < classesArray.length; i++) {
        let classBox = document.createElement("input")
        classBox.type = "checkbox"
        classBox.id = classesArray[i]
        classBox.value = classesArray[i]
        if (classesFiltered.includes(classesArray[i].toLowerCase())) {
            classBox.checked = true
        }
        classBox.addEventListener("change", function () {
            let value = this.value.trim()
            if (this.checked) {
                classesFiltered.push(value)
            } else {
                classesFiltered.pull(value)
            }
            setQuery("class", classesFiltered.fuse(","))
            reFilter()
            filteredSpells = 0
            let validKeys = []
            Object.keys(spellStats["classes"]).forEach(key => {
                for (let i = 0; i < classesFiltered.length; i++) {
                    if (key.includes(classesFiltered[i])) {
                        validKeys.push(key)
                    }
                }
            })
            validKeys = Array.from(new Set(validKeys))
            for (let i = 0; i < validKeys.length; i++) {
                filteredSpells += spellStats["classes"][validKeys[i]]
            }
            classesAmount.textContent = "Valid Spells: " + filteredSpells
        })
        classesRaw.appendChild(classBox)
        let classLabel = document.createElement("label")
        classLabel.textContent = classesArray[i]
        classLabel.htmlFor = classesArray[i]
        classesRaw.appendChild(classLabel)
        classesRaw.spacer()
    }
    parent.appendChild(classesRaw)

    let levelsTitle = document.createElement("h2")
    levelsTitle.textContent = "Levels"
    parent.appendChild(levelsTitle)
    let levelsAmount = document.createElement("h6")
    levelsAmount.textContent = "Valid Spells: *"
    parent.appendChild(levelsAmount)
    let minTitle = document.createElement("h4")
    minTitle.textContent = "Minimum Level"
    parent.appendChild(minTitle)
    let minSlider = document.createElement("input")
    minSlider.type = "range"
    minSlider.id = "minSlider"
    minSlider.min = "0"
    minSlider.max = "9"
    minSlider.value = getQuery("minLevel") ? getQuery("minLevel") : 0
    minSlider.addEventListener("change", function () {levelFilter()})
    let minLabel = document.createElement("label")
    minLabel.htmlFor = "minSlider"
    parent.appendChild(minLabel)
    parent.appendChild(minSlider)
    let maxTitle = document.createElement("h4")
    maxTitle.textContent = "Maximum Level"
    parent.appendChild(maxTitle)
    let maxSlider = document.createElement("input")
    maxSlider.type = "range"
    maxSlider.id = "maxSlider"
    maxSlider.min = "0"
    maxSlider.max = "9"
    maxSlider.value = getQuery("maxLevel") ? getQuery("maxLevel") : 9
    maxSlider.addEventListener("change", function () {levelFilter()})
    let maxLabel = document.createElement("label")
    maxLabel.htmlFor = "maxSlider"
    parent.appendChild(maxLabel)
    function levelFilter() {
        filteredSpells = 0
        let min = parseInt(minSlider.value)
        let max = parseInt(maxSlider.value)
        minLabel.textContent = String(min)
        maxLabel.textContent = String(max)
        if (min > max) {
            minSlider.value = String(max)
            min = max
        }
        if (max < min) {
            maxSlider.value = String(min)
            max = min
        }
        for (let i = min; i < max + 1; i++) {
            filteredSpells += spellStats["level"][i]
        }
        minLabel.textContent = minSlider.value
        maxLabel.textContent = maxSlider.value
        setQuery("minLevel", min)
        setQuery("maxLevel", max)
        levelsAmount.textContent = "Valid Spells: " + filteredSpells
        reFilter()
    }
    parent.appendChild(maxSlider)
    levelFilter()

    parent.spacer(2)
    let sortTitle = document.createElement("h3")
    sortTitle.id = "sort"
    sortTitle.textContent = "Sort by "
    parent.appendChild(sortTitle)
    let direction = parent.createSelect(["Ascending", "Descending"], ["", "true"])
    direction.addEventListener("change", function () {
        setQuery("desc", this.value)
        reFilter()
    })
    let key = parent.createSelect(["Level", "Name", "School"])
    key.addEventListener("change", function () {
        setQuery("sort", this.value)
        reFilter()
    })
    parent.spacer()

    reFilter()
}

id("searchButton").addEventListener("click",  function() {setQuery("search", id("searchSpell").value); renderSpells()});
id("searchSpell").addEventListener("keydown", function(event) {if (event.key === "Enter") {setQuery("search", id("searchSpell").value); renderSpells()}})
id("searchSpell").addEventListener("blur", function() {setQuery("search", id("searchSpell").value); renderSpells()});
id("filter").addEventListener("click", function() {
    if (this.textContent === "close") {
        showSpell()
        this.textContent = "filter_alt"
    } else {
        filter()
        this.textContent = "close"
    }
})

id("searchSpell").value = getQuery("search")

if (getQuery("spell")) {
    showSpell()
}
renderSpells()