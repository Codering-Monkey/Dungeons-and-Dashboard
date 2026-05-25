import { id, overlay } from "../script.js"

let bar = id("bar")
let input = id("dataInput")
for (let i = 0; i < bar.children.length; i++) {
    bar.children[i].addEventListener("click", function () {
        for (let k = 0; k < bar.children.length; k++) {
            bar.children[k].setAttribute("active", "false")
        }
        this.setAttribute("active", "true")
        input.clear()
        if (this.textContent === "ink_pen") {
            input.appendChild(document.createElement("textarea"))
        } else if (this.textContent === "link") {
            let textInput = document.createElement("input")
            textInput.type = "text"
            input.appendChild(textInput)
        } else if (this.textContent === "file_copy") {
            let fileInput = document.createElement("input")
            fileInput.type = "file"
            fileInput.setAttribute("accept", ".json")
            input.appendChild(fileInput)
            fileInput.label()
        }
    })
}

id("button").addEventListener("click", async function () {
    let currentImport = localStorage.get("Import")
    if (!currentImport) {
        currentImport = {"Spells": {}}
    }
    let newData
    let child = input.children[0]
    if (child.tagName === "TEXTAREA") {
        newData = JSON.parse(child.value)
    } else if (child.type === "text") {
        newData = await fetch(child.value, {
            method: "GET",
            }
        ).then((response) => response.json())
    } else if (child.type === "file") {
        newData = JSON.parse(await child.files[0].read())
    }
    try {
        Object.entries(newData).forEach(([key, value]) => {
            currentImport[key] = (currentImport[key] || {})
            Object.entries(newData[key]).forEach(([innerKey, innerValue]) => {
                currentImport[key][innerKey] = innerValue
            })
        })
        localStorage.set("Import", currentImport)
    } catch (e) {
        alert(`Skill Issue: ${e.message}`)
    }
    renderData()
})

let data = id("data")
function renderData() {
    data.clear()
    let imports = localStorage.get("Import")
    Object.keys(imports).forEach((key) => {
        if (imports[key] && Object.keys(imports[key]).length > 0) {
            let tile = document.createElement("div")
            data.appendChild(tile)
            let title = document.createElement("h3")
            title.textContent = key
            tile.appendChild(title)
            Object.keys(Object.fromEntries(Object.entries(imports[key]).sort((a, b) => a[0].localeCompare(b[0])))).forEach(innerKey => {
                let item = document.createElement("div")
                tile.appendChild(item)
                item.addEventListener("click", function () {
                    delete imports[key][innerKey]
                    localStorage.set("Import", imports)
                    renderData()
                })

                let bin  = document.createElement("span")
                bin.classList.add("material-symbols-outlined")
                bin.textContent = "delete"
                item.appendChild(bin)

                let text = document.createElement("p")
                text.textContent = innerKey
                item.appendChild(text)
            })
        }
    })
}

id("guide").addEventListener("click", function () {
    let overlayItem = overlay()
    overlayItem.createElement("h2").textContent = "How to Import"
    overlayItem.createElement("p").textContent = "The file structure for this website is loosely based off of MPMB's (More Purple More Better) custom form-fillable character sheets, and much of the data was gathered from free to use online sources (so that i dont have to manually transcribe it all) as such i have decided to leave links to downlad all my .json files for your own reference/usages"
    overlayItem.createElement("p").textContent = "In order to import, attach a JSON formatted string / file / link, where each catagory you wish to import into is a separate key"
    let linkItem = overlayItem.createElement("a")
    linkItem.download = "sampleImport.json"
    linkItem.href = "sampleImport.json"
    linkItem.textContent = "Sample Import"
    overlayItem.break()
    overlayItem.break()
    let importParent = overlayItem.createElement("div", "importParent")
    let importables = ["Armour", "Backgrounds", "Classes", "Colours", "Feats", "Gaming", "Gear", "Instruments", "OtherTools", "Packs", "Premade", "Species", "Spells", "Subclasses", "Tools", "Weapons"]
    importables.forEach(importable => {
        let linkItem = importParent.createElement("a")
        let link = `/Data/${importable.toLowerCase()}.json`
        linkItem.download = link
        linkItem.href = link
        linkItem.textContent = importable
    })
})

renderData()