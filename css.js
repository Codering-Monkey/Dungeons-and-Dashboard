export function hoverShadow(object, colour, sizeX=2, sizeY=2, unit="px") {
    const oldShadow = object.style.boxShadow
    object.addEventListener("mouseenter", function() {
        object.style.boxShadow = `${sizeX}${unit} ${sizeY}${unit} ${colour}`
    })
    object.addEventListener("mouseleave", function() {
        object.style.boxShadow = oldShadow
    })
}

export function hoverBackground(object, colour) {
    const oldBackground = object.style.backgroundColor
    object.addEventListener("mouseenter", function() {
        object.style.backgroundColor = colour
    })
    object.addEventListener("mouseleave", function() {
        object.style.backgroundColor = oldBackground
    })
}