Storage.prototype.set = function(key, value) {
  this.setItem(key, JSON.stringify(value));
};

Storage.prototype.get = function(key) {
  const item = this.getItem(key);
  return item ? JSON.parse(item) : null;
};

Object.prototype.clear = function(keep=0) {
    while (this.childNodes.length > keep) {
		this.removeChild(this.lastChild)
	}
}

Object.prototype.spacer = function(amount=1) {
    for (let i = 0; i < amount; i++) {
        this.appendChild(document.createElement("br"))
    }
}

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

export function id(Object_ID) {
	return document.getElementById(Object_ID)
}

Array.prototype.fuse = function() {
    let string = ""
	for (let i = 0; i < this.length; i++) {
		string += this[i]
	}
	return string
}

Object.prototype.invert = function() {
    let newObject = {}
    Object.entries(this).forEach(([key, value]) => {
        newObject[value] = key
    })
    return newObject
}

Location.prototype.getQuery = function(key=null) {
    if (key) {
        return new URLSearchParams(location.search).get(key)
    } else {
        return new URLSearchParams(location.search)
    }
}

Location.prototype.saveQuery = function(parameters) {
    location.search = parameters.toString()
}

Location.prototype.setQuery = function(key, value) {
    let currentParams = this.getQuery()
    currentParams.set(key, value)
    this.saveQuery(currentParams)
}

let popupBar = document.createElement("div");
popupBar.classList.add("popup-bar");
document.body.appendChild(popupBar);

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
