import "./script.js"

export function loadColours() {
    let existingSchema = localStorage.get("colourScheme");
    if (!existingSchema) {
        existingSchema = "system"
        localStorage.set("colourScheme", existingSchema);
    }

    if (existingSchema === "system") {
        if (window.matchMedia('(prefers-color-scheme: light)').matches) {
            existingSchema = "light"
        } else {
            existingSchema = "dark"
        }
    }

    let colourMix = "white"
    if (existingSchema === "light") {
        colourMix = "black"
    }

    document.body.setAttribute("colour_scheme", existingSchema)

    let primary = localStorage.get("primary")
    if (!primary) {
        primary = "#ff00ff"
        localStorage.set("primary", primary);
    }
    document.documentElement.style.setProperty("--primary", "color-mix(in srgb, " + primary + ", " + colourMix + ")")

    let secondary = localStorage.get("secondary")
    if (!secondary) {
        secondary = '#00ffff'
        localStorage.set("secondary", secondary);
    }
    document.documentElement.style.setProperty("--secondary", "color-mix(in srgb, " + secondary + ", " + colourMix + ")")
}

loadColours()