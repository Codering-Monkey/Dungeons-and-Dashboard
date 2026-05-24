import { id } from "../script.js"
import colours from "../Data/colours.json" with { type: "json" }
colours.homebrew("Colours")

localStorage.set("primary", (localStorage.get("primary") || "Red"))
localStorage.set("secondary", (localStorage.get("secondary") || "Green"))

function loadColours() {
    document.body.style.setProperty("--primary", (colours[(localStorage.get("primary") || "Red")] || colours["Red"]))
    document.body.style.setProperty("--secondary", (colours[(localStorage.get("secondary") || "Green")] || colours["Green"]))
}

function renderColourBox(currentProperty, otherProperty) {
    let parent = id(currentProperty)
    parent.clear()
    Object.entries(colours).forEach(([key, value]) => {
        let colourItem = parent.createElement("div")
        colourItem.style.setProperty("--feature-colour", value)
        colourItem.createElement("div")
        colourItem.createElement("p").textContent = key
        if (key === localStorage.get(otherProperty)) {
            colourItem.classList.add("selected")
        } else {
            if (key === localStorage.get(currentProperty)) {
                colourItem.classList.add("active")
            }
            colourItem.addEventListener("click", function() {
                localStorage.set(currentProperty, key)
                loadColours()
                renderColourBox("primary", "secondary")
                renderColourBox("secondary", "primary")
            })
        }
    })
}

renderColourBox("primary", "secondary")
renderColourBox("secondary", "primary")