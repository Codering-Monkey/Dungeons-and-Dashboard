import {id, popup, roll} from "../script.js"
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

let colourMode = id("colourMode")
colourMode.value = "dark"
const insults = [
    "no",
    "Because you exist, along with Dinosaurs",
    "Because you exist, along with Unicorns",
    "Because you exist, along with Fairies",
    "FLASHBANG!",
    "Let me save you some battery",
    "ew no",
    "Allow me to introduce you to dark mode",
    "Come to the Dark Side, we have Dungeons and Dashboard",
    "You cannot be serious",
    "What if... you didn't?",
    "Try Sunlight First",
    "EA wants me to charge you $9.99 for that",
    "Dark Mode was season 1, but Netflix cancelled anything after that",
    "I will delete system32",
    "I will install Linux on here"
]
colourMode.addEventListener("change", function() {
    if (this.value === "light") {
        this.value = "dark"
        popup(insults[roll(insults.length) - 1])
    }
})