class LogicError extends Error {
  constructor(message) {
    super(message);
    this.name = "LogicError";
  }
}

// HTML "Fixes"
HTMLInputElement.prototype.label = function() {
    if (this.type === "file") {
        let label = document.createElement("label")
        label.textContent = "Choose File"
        label.classList.add("file")
        if (!this.id) {
            this.id = "input" + document.getElementsByTagName("INPUT").length
        }
        this.parentElement.insertBefore(label, this)
        label.htmlFor = this.id
        this.addEventListener("change", function() {
            if (this.value) {
                label.textContent = "Chosen File: " + this.files[0].name
            } else {
                label.textContent = "Choose File"
            }
        })
    } else {
        throw new TypeError("This is only available where 'type'==='file'")
    }
}

HTMLInputElement.prototype.buttons = function() {
    if (this.type === "number") {
        let inputThis = this
        let parent = this.parentElement
        let container = document.createElement("div")
        container.classList.add("inputNumberParent")
        if (parent) {
            parent.insertBefore(container, this)
        } else {
            throw new LogicError("Please Append this Object prior to calling .buttons()")
        }
        inputThis.addEventListener("change", function() {
            if (this.min && (parseInt(this.value) < parseInt(this.min))) {
                this.value = this.min
            } else if (this.max && (parseInt(this.value) > parseInt(this.max))) {
                this.value = this.max
            }
        })
        let subtract = document.createElement("button")
        container.appendChild(subtract)
        subtract.textContent = "-"
        subtract.addEventListener("click", function(event) {
            if (!(inputThis.min) || parseInt(inputThis.value) - 1 >= parseInt(inputThis.min)) {
                if (inputThis.min && event.shiftKey) {
                    inputThis.value = inputThis.min
                } else {
                    inputThis.value = String(parseInt(inputThis.value) - 1)
                }
                inputThis.textContent = inputThis.value
                container.setAttribute("value", inputThis.value)
                inputThis.dispatchEvent(new Event("change"))
            }
        })
        container.appendChild(this)
        let add = document.createElement("button")
        add.textContent = "+"
        container.appendChild(add)
        add.addEventListener("click", function(event) {
            if (!(inputThis.max) || inputThis.max && parseInt(inputThis.value) + 1 <= parseInt(inputThis.max)) {
                if (inputThis.max && event.shiftKey) {
                    inputThis.value = inputThis.max
                } else {
                    inputThis.value = String(parseInt(inputThis.value) + 1)
                }
                inputThis.textContent = inputThis.value
                container.setAttribute("value", inputThis.value)
                inputThis.dispatchEvent(new Event("change"))
            }
        })
    } else {
        throw new TypeError("This is only available where 'type'==='number'")
    }
}

let inputs = document.getElementsByTagName("INPUT")
for (let i = 0; i < inputs.length; i++) {
    if (!inputs[i].classList.contains("ignore")) {
        if (inputs[i].type === "file" ) {
            inputs[i].label()
        } else if (inputs[i].type === "number") {
            inputs[i].buttons()
        }
    }
}

// Prototypes
/**
 * Sets a JSON object in storage
 * @param {string} key
 * @param {any} value
 */
Storage.prototype.set = function(key, value) {
  this.setItem(key, JSON.stringify(value));
};

/**
 * Fetches a JSON object from storage, returning null if not present
 * @param {string} key
 * @returns {any|null}
 */
Storage.prototype.get = function(key) {
  const item = this.getItem(key);
  return item ? JSON.parse(item) : null;
};

Storage.prototype.push = function(key, value) {
    let data = this.get(key);
    if (Array.isArray(data)) {
        data.push(value)
        this.set(key, data)
    } else {
        throw TypeError(`Object Stored at '${key}' is not an Array`)
    }
}

Storage.prototype.pull = function(key, value) {
    let data = this.get(key);
    if (Array.isArray(data)) {
        data.pull(value)
        this.set(key, data)
    } else {
        throw TypeError(`Object Stored at '${key}' is not an Array`)
    }
}

Storage.prototype.indexGet = function(key, index) {
    return this.get(key)[index]
}

Storage.prototype.indexSet = function(key, index, value) {
    let data = this.get(key);
    data[index] = value
    this.set(key, data)
}

Storage.prototype.wipe = function(...items) {
    for (let i = 0; i < items.length; i++) {
        this.removeItem(items[i])
    }
}

HTMLInputElement.prototype.label = function(labelText) {
    if (!this.id) {
        let namingCount = 0
        while (id(labelText + namingCount)) {
            namingCount += 1
        }
        this.id = labelText + namingCount
    }
    let labelElement = document.createElement("label")
    labelElement.textContent = labelText
    labelElement.htmlFor = this.id
    if (this.type === "number") {
        this.parentElement.parentElement.insertBefore(labelElement, this.parentElement)
    } else {
        this.parentElement.insertBefore(labelElement, this)
    }
}

/**
 * Creates a td object to append a child in
 * @param {object} object
 */
HTMLElement.prototype.shellAppend = function (object) {
    let shell = document.createElement("td")
    this.appendChild(shell)
    shell.appendChild(object)
}

/**
 * Clears the Object, keeping the first {keep} elements
 * @param {number} keep
 */
HTMLElement.prototype.clear = function(keep=0) {
    while (this.children.length > keep) {
		this.removeChild(this.lastChild)
	}
}

/**
 * Adds Line breaks to Object {amount} amount of times
 * @param {number} amount
 */
HTMLElement.prototype.break = function(amount=1) {
    for (let i = 0; i < amount; i++) {
        this.appendChild(document.createElement("br"))
    }
}

/**
 * Adds blank divs to Object {amount} time
 * @param {number} amount
 */
HTMLElement.prototype.blank = function(amount=1) {
    for (let i = 0; i < amount; i++) {
        this.appendChild(document.createElement("div"))
    }
}

/**
 * Capitalises the first word in the string, or all words (separated by " ") if {allWords}. returns the String
 * @param {boolean} allWords
 * @returns {string}
 */
String.prototype.capitalise = function(allWords=false) {
    let stringWords
	if (allWords) {
		stringWords = this.split(" ")
	} else {
		stringWords = [this]
	}
	for (let i = 0; i < stringWords.length; i++) {
		stringWords[i] = stringWords[i][0].toUpperCase() + stringWords[i].slice(1)
        if (i < stringWords.length - 1) {
            stringWords[i] += " "
        }
	}
	return stringWords.fuse()
}

/**
 * Returns a HTML element from its ID
 * @param {string} Object_ID
 * @returns {HTMLElement}
 */
export function id(Object_ID) {
	return document.getElementById(Object_ID)
}

export function any(...booleans) {
    for (let i = 0; i < booleans.length; i++) {
        if (booleans[i]) {return true}
    }
    return false
}

HTMLElement.prototype.createElement = function(tag, classList="") {
    let element = document.createElement(tag);
    element.className = classList;
    this.appendChild(element)
    return element
}

HTMLTableElement.prototype.columnWidth = function(...widths) {
    let columnGroup = document.createElement("colgroup");
    for (let i = 0; i < widths.length; i++) {
        columnGroup.createElement("col").width = widths[i]
    }
    this.insertBefore(columnGroup, this.firstChild)
}

/**
 * Fuses an Array into a string, with {gap} between them
 * @param {string} gap
 * @returns {string}
 */
Array.prototype.fuse = function(gap="") {
    let string = ""
	for (let i = 0; i < this.length; i++) {
		string += this[i] + gap
	}
    if (gap.length === 0) {
        return string
    } else {
        return string.slice(0, gap.length * -1)
    }
}

/**
 * Fuses an array, with commas between each item and 'and' prior to the last
 * @returns {string}
 */
Array.prototype.commaFuse = function() {
    let final = structuredClone(this)
    if (this.length === 2) {
        final = [this[0], " and ", this[1]]
    } else if (this.length > 1) {
        final.splice(this.length - 1, 0, " and ")
        for (let i = this.length - 1; i > 0; i--) {
            final.splice(i, 0, ", ")
        }
    }
    return final.fuse()
}

/**
 * The opposite of Array.push(). removes an element based on its value. returns the values index
 * @param {any} value
 * @returns {number}
 */
Array.prototype.pull = function(value) {
    let index = this.indexOf(value);
    this.splice(index, 1)
    return index
}

/**
 * Pushes each item in {value} to the Array
 * @param {Array} value
 */
Array.prototype.pushAll = function(value) {
    for (let i = 0; i < value.length; i++) {
        this.push(value[i])
    }
}

/**
 * This was created cause PyCharm complains about Math.sumPrecise
 * @returns {number}
 */
Array.prototype.sum = function() {
    let total = 0
    for (let i = 0; i < this.length; i++) {
        total += this[i]
    }
    return total
}

Array.prototype.toLowerCase = function() {
    let final = []
    for (let i = 0; i < this.length; i++) {
        final.push(this[i].toLowerCase())
    }
    return final
}

/**
 * Returns the Object with its values as keys and keys as values
 * @returns {{}}
 */
Object.prototype.invert = function() {
    let newObject = {}
    Object.entries(this).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            for (let i = 0; i < value.length; i++) {
                newObject[value[i]] = key
            }
        } else {
            newObject[value] = key
        }
    })
    return newObject
}

/**
 * Gets the parameters of location.search. returns all parameters unless {key} is provided
 * @param key
 * @returns {URLSearchParams|string}
 */
export function getQuery(key=null) {
    if (key) {
        return new URLSearchParams(location.search).get(key)
    } else {
        return new URLSearchParams(location.search)
    }
}

/**
 * Sets the URL's search parameters without reloading the page
 * @param {any} key
 * @param {any} value
 */
export function setQuery(key, value) {
    const url = new URL(window.location)
    url.searchParams.set(key, value)
    window.history.replaceState({}, '', url)
}

/**
 * Returns the number with its suffix (1st for 1, 23rd for 23)
 * @param {number} number
 * @returns {string}
 */
export function numSuffix(number) {
    number = String(number)
    let finalDigit = number.slice(-1)
    let otherDigits = number.slice(0, -1)
    if (["11", "12", "13"].includes(number)) {
        return number + "th"
    }
    if (finalDigit === "1") {
        return otherDigits + "1st"
    } else if (finalDigit === "2") {
        return otherDigits + "2nd"
    } else if (finalDigit === "3") {
        return otherDigits + "3rd"
    } else {
        return otherDigits + finalDigit + "th"
    }
}

/**
 * Creates and appends a select object with all options, with values being the values of the object at the same position
 * @param {string[]} options
 * @param {string[]|false} values optional, must be the same length as options
 * @returns {Object} the select element
 */
HTMLElement.prototype.createSelect = function(options, values=false) {
    let select = document.createElement("select");
    if (!values) {
        values = options
    }
    for (let i = 0; i < options.length; i++) {
        let option = document.createElement("option");
        option.textContent = options[i]
        option.value = values[i]
        select.appendChild(option)
    }
    this.appendChild(select);
    return select
}

/**
 * Reads a File
 * @returns {Promise<unknown>}
 */
File.prototype.read = function() {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.onload = () => {
            resolve(reader.result);
        }
        reader.readAsText(this)
    })
}

/**
 * DOES NOTHING YET LOL (will eventually add dice rolling buttons and such)
 * @returns {String}
 */
String.prototype.parse = function(player) {
    player = (player || {"Stats": {}})
    return eval(`let level = ${(player["Level"] || 0)}; let str = ${(player["Stats"]["Str"] || 0).modifier()}; let dex = ${(player["Stats"]["Dex"] || 0).modifier()}; let con = ${(player["Stats"]["Con"] || 0).modifier()}; let int = ${(player["Stats"]["Int"] || 0).modifier()}; let wis = ${(player["Stats"]["Wis"] || 0).modifier()}; let cha = ${(player["Stats"]["Cha"] || 0).modifier()}; let prof = ${(player["Prof Bonus"] || 0)}; \`${this}\``)
}

/**
 * Rolls a Dice, defaults to d20
 * @returns {number}
 */
export function roll(sides=20) {
    return Math.floor(Math.random() * sides) + 1
}

/**
 * Returns the number with "+" if positive
 * @returns {string}
 */
Number.prototype.symbol = function() {
    if (this > 0) {
        return "+" + String(this)
    } else {
        return String(this)
    }
}

Number.prototype.bonus = function() {
    if (this === 0) {
        return ""
    } else if (this > 0) {
        return " + " + String(this)
    } else if (this < 0) {
        return " - " + String(this * -1)
    } else {
        return String(this)
    }
}

Number.prototype.modifier = function() {
    return Math.floor((this - 10) / 2)
}

String.prototype.modifier = function() {
    return parseInt(this).modifier()
}

export function merge(...objects) {
    let final = {}
    for (let i = 0; i < objects.length; i++) {
        Object.entries(objects[i]).forEach(([key, value]) => {
            final[key] = value
        })
    }
    return final
}

export function forceArray(baseValue) {
    if (Array.isArray(baseValue)) {
        if (baseValue.length !== 20) {
            let fillValue = baseValue.slice(-1)[0]
            baseValue.length = 20
            baseValue.fill(fillValue)
        }
        return baseValue
    } else {
        let fillValue = baseValue
        baseValue = Array(20)
        baseValue.fill(fillValue)
        return baseValue
    }
}

export function forceLevel(baseValue, level) {
    return forceArray(baseValue)[level - 1]
}

// Popup

let popupBar = document.createElement("div");
popupBar.classList.add("popup-bar");
document.body.appendChild(popupBar);

/**
 * Creates a popup in the bottom right corner, with the content of {data}
 * @param {string} data
 */
export function popup(data) {
    let popup = document.createElement("div")
    popup.classList.add("popup")
    popup.textContent = data
    popupBar.appendChild(popup)

    let progressBar = document.createElement("div")
    progressBar.classList.add("progress-bar")
    popup.appendChild(progressBar)

    let progressAmount = document.createElement("div")
    progressAmount.classList.add("progress")
    progressBar.appendChild(progressAmount)

    setTimeout(function() {
        popup.style.marginRight = "8px"
        setTimeout(function() {
            fill()
        }, 1000)
    }, 1)

    popup.addEventListener("click", function() {
        remove()
    })

    function remove() {
        popup.style.marginRight = "-208px"
        setTimeout(function() {
            popup.remove()
        }, 1000)
    }

    function fill() {
        let startingWidth = parseFloat(progressAmount.style.width)
        if (!startingWidth) {
            startingWidth = 0
        }
        const multiplier = (200 - startingWidth) / 200
        progressAmount.style.width = "200px"
        progressAmount.style.transitionDuration = (5 * multiplier) + "s"
        setTimeout(function(){
            let amount = parseFloat(window.getComputedStyle(progressAmount).getPropertyValue('width'))
            if (amount === 200) {
                remove()
            }
        }, 5050 * multiplier);
    }

    popup.addEventListener("mouseover", function() {
        progressAmount.style.width = window.getComputedStyle(progressAmount).getPropertyValue('width')
    })

    popup.addEventListener("mouseout", function() {
        fill()
    })

    popup.addEventListener("click", function() {
        remove()
    })
}

// Overlay

/**
 * Creates an Overlay
 * @param {function} closeEvent
 * @param {boolean} closeable
 * @returns {HTMLDivElement}
 */
export function overlay(closeEvent=function() {}, closeable=true) {
    let overlay = document.createElement("div");
    overlay.classList.add("overlay");
    overlay.id = "overlay"
    if (closeable) {
        overlay.addEventListener("click", function(event) {if (event.target.id === "overlay") {this.parentElement.removeChild(this); closeEvent()}})
    }
    document.body.appendChild(overlay);

    let box = document.createElement("div");
    overlay.appendChild(box);
    return box
}

// Importing Code

Object.prototype.homebrew = function(dataKey) {
    let importData = localStorage.get("Import")
    if (importData && importData[dataKey]) {
        let specificData = importData[dataKey]
        Object.entries(specificData).forEach(([key, value]) => {
            this[key] = value
        })
    }
}

// Spell Sorting

import spellData from "./Data/spells.json" with { type: "json" }
spellData.homebrew("Spells")

/**
 * @param {string} query
 * @param {string[]} sources
 * @param {string[]} schools
 * @param {string[]} classes
 * @param {number} minLevel
 * @param {number} maxLevel
 */
export function filterSpells(query, sources, schools, classes, minLevel=0, maxLevel=9) {
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

// colours

import colours from "./Data/colours.json" with { type: "json" }
colours.homebrew("Colours")

document.body.style.setProperty("--primary", (colours[(localStorage.get("primary") || "Red")] || colours["Red"]))
document.body.style.setProperty("--secondary", (colours[(localStorage.get("secondary") || "Green")] || colours["Green"]))
