import { id } from "../script.js"

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
            Object.entries(newData[key]).forEach(([innerKey, innerValue]) => {
                currentImport[key][innerKey] = innerValue
            })
        })
        localStorage.set("Import", currentImport)
    } catch (e) {
        alert(`Skill Issue: ${e.message}`)
    }
    }
)
