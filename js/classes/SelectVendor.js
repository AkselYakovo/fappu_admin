const template = document.createElement("template")
template.innerHTML = `
<style>
  @import url("../../css/style.css");
</style>
<div class="toolbar vendor-input" data-display="">
  <div class="main-bar">
    <figure class="vendor__avatar">
      <img src="" alt="" draggable="false">
    </figure>
    <input type="text" class="vendor__input" value="" placeholder="" autocomplete="off" name="Vendor Input">
  </div>
  <ul class="options-list"></ul>
</div>
`

class SelectVendor extends HTMLElement {
  static observedAttributes = ["placeholder"]

  static createOptionNode(vendorID) {
    const optionNode = document.createElement("li")
    optionNode.setAttribute("data-display", `@${vendorID}`)
    optionNode.classList.add("option")
    optionNode.innerHTML = `
      <figure class='vendor__avatar'>
        <img src='../assets/vendors/${vendorID}.png' >
      </figure>
      <span class='vendor__label'>@${vendorID}</span>
    `
    return optionNode
  }

  constructor() {
    super()
    const clone = template.content.cloneNode(true)
    this.root = this.attachShadow({ mode: "closed" })
    this.root.append(clone)
    this.parent = this.root.querySelector("div.vendor-input")
    this.textInput = this.root.querySelector(".vendor-input input")
    this.optionsList = this.root.querySelector("ul.options-list")
    this.vendorImage = this.root.querySelector(".vendor__avatar img")

    this.value = null
    this.timeoutNumber = null
    this.vendorsArray = null
    this.requestExists = false
  }

  connectedCallback() {
    this.setTextInputHanlders()
    this.setOptionListHandlers()
  }

  attributeChangedCallback(attribute, oldVal, newVal) {
    this.textInput.setAttribute("placeholder", newVal)
  }

  async fetchVendors(query) {
    if (this.requestExists) {
      return false
    }

    this.requestExists = true
    const url = "./hub.php"
    const data = new FormData()
    const body = {
      method: "POST",
      body: data,
    }

    data.append("__PULL", "1")
    data.append("__VENDORS", "1")
    data.append("__QUERY", query)

    const result = await fetch(url, body)
      .then((req) => {
        if (req.ok) return req.json()
      })
      .then((data) => {
        if (data.length) {
          this.vendorsArray = data
          return true
        } else return false
      })
      .finally(() => {
        this.requestExists = false
      })

    return result
  }

  fillOptionsList() {
    this.parent.classList.add("visible-menu")
    this.optionsList.innerHTML = ""

    for (let i = 0; i < this.vendorsArray.length; i++) {
      const currentVendor = this.vendorsArray[i].ID
      const optionNode = SelectVendor.createOptionNode(currentVendor)
      this.optionsList.append(optionNode)
    }
  }

  hideOptionsList() {
    this.parent.classList.remove("visible-menu")
  }

  isValid() {
    if (this.value && this.value != "") {
      return true
    }

    return false
  }

  setOptionListHandlers() {
    this.optionsList.addEventListener("click", (e) => {
      let data, image

      if (e.target.tagName === "LI") {
        data = e.target.getAttribute("data-display")
      } else if (e.target.parentNode.tagName === "LI") {
        data = e.target.parentNode.getAttribute("data-display")
      }

      image = `../assets/vendors/${data.substring(1)}.png`
      this.vendorImage.src = image
      this.value = data
      this.textInput.value = ""
      this.textInput.setAttribute("placeholder", data)

      this.hideOptionsList()
    })
  }

  setTextInputHanlders() {
    this.textInput.addEventListener("keyup", () => {
      const query = this.textInput.value

      if (query === "") {
        clearTimeout(this.timeoutNumber)
        return
      }

      if (this.timeoutNumber) {
        clearTimeout(this.timeoutNumber)
      }

      this.timeoutNumber = setTimeout(async () => {
        const hasVendors = await this.fetchVendors(query)
        if (hasVendors) this.fillOptionsList()
        else this.hideOptionsList()
      }, 2000)
    })

    this.textInput.addEventListener("focusin", () => this.showOptionsList())
  }

  showOptionsList() {
    this.parent.classList.add("visible-menu")
  }
}

customElements.define("select-vendor", SelectVendor)

export default SelectVendor
