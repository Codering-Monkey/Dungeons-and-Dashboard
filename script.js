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

let popupBar = document.createElement("div");
popupBar.classList.add("popup-bar");
document.body.appendChild(popupBar);

export function popup(data) {
    let popup = document.createElement("div")
    popup.classList.add("popup")
    popup.style.right = "0"
    popup.textContent = data
    popupBar.appendChild(popup)

    let progressBar = document.createElement("div")
    progressBar.classList.add("progress-bar")
    popup.appendChild(progressBar)
}

/*export function popup(data) {
    const existing = document.getElementsByClassName("popup")
    const current = existing.length
    let pop = document.createElement("div")
    pop.classList.add("popup")
    pop.id = "popup" + current
    const destination = (current * 216) + "px"
    let text = document.createElement("span")
    text.textContent = data
    pop.appendChild(text)
    let bar = document.createElement("div")
    bar.classList.add("progress-bar")
    pop.appendChild(bar)
    let progress = document.createElement("div")
    progress.classList.add("progress")
    progress.id = "bar" + current
    bar.appendChild(progress)
    document.body.appendChild(pop)
    setTimeout(function(){
        pop.style.right = destination
        setTimeout(function(){
            fillBar(current)
        }, 1000);
    }, 1);

    function fillBar(IdNum) {
        const oldWidth = parseFloat(progress.style.width)
        const multiplier = (200 - oldWidth) / 200
        progress.style.width = "200px"
        progress.style.transitionDuration = (5 * multiplier) + "s"
        setTimeout(function(){
            if (window.getComputedStyle(document.getElementById("bar" + IdNum)).getPropertyValue('width') === "200px") {
                endPopup(IdNum)
            }
        }, 5050 * multiplier);
    }

    function endPopup(IdNum) {
        const existing = document.getElementsByClassName("popup")
        const current = existing.length
        for (let i = IdNum + 1; i < current; i++) {
            let pop = document.getElementById("popup" + i)
            const old = parseFloat(pop.style.right)
            pop.style.right = (old - 216) + "px"
        }
        let pop = document.getElementById("popup" + IdNum)
        pop.style.right = "-250px"
        setTimeout(function () {
            pop.remove()
        }, 1000)
    }

    pop.addEventListener("mouseover", function() {
        progress.style.width = window.getComputedStyle(document.getElementById("bar" + current)).getPropertyValue('width')
    })

    pop.addEventListener("mouseout", function () {
        fillBar(current)
    })

    pop.addEventListener("click", function () {
        endPopup(current)
    })
}*/

popup("hi")
popup("hi")
popup("hey buddy, how are you going? good, good")