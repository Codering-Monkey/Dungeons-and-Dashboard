// HTML "Fixes"

let inputs = document.getElementsByTagName("INPUT")
for (let i = 0; i < inputs.length; i++) {
    if (inputs[i].type === "file" ) {
        inputs[i].label()
    }
}


// Prototypes
HTMLElement.prototype.label = function() {
    if (this.tagName === "INPUT") {
        if (this.type === "file") {
            let label = document.createElement("label")
            label.textContent = "Choose File"
            if (!this.id) {
                this.id = "input" + document.getElementsByTagName("INPUT").length
            }
            this.parentElement.insertBefore(label, this)
            label.htmlFor = this.id
        } else {
            throw new TypeError("This is only available where 'type'==='file'")
        }
    } else {
        throw new TypeError("This is only available for INPUT elements")
    }
}

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

/**
 * Clears the Object, keeping the first {keep} elements
 * @param {number} keep
 */
Object.prototype.clear = function(keep=0) {
    while (this.childNodes.length > keep) {
		this.removeChild(this.lastChild)
	}
}

/**
 * Adds Line breaks to Object {amount} amount of times
 * @param {number} amount
 */
Object.prototype.spacer = function(amount=1) {
    for (let i = 0; i < amount; i++) {
        this.appendChild(document.createElement("br"))
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
 * Returns the Object with its values as keys and keys as values
 * @returns {{}}
 */
Object.prototype.invert = function() {
    let newObject = {}
    Object.entries(this).forEach(([key, value]) => {
        newObject[value] = key
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
Object.prototype.createSelect = function(options, values=false) {
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
String.prototype.parse = function() {
    return this
}

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
            console.log(amount)
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

// Importing Code

Object.prototype.homebrew = function(dataKey) {
    let importData = localStorage.get("Import")
    if (importData) {
        let specificData = importData[dataKey]
        Object.entries(specificData).forEach(([key, value]) => {
            this[key] = value
        })
    }
}
