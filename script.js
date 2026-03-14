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
