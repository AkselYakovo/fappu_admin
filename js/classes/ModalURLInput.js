const template = document.createElement("template")
template.innerHTML = `
  <style>
    @import url("../../css/style.css")
  </style>
  <div class="toolbar url-input top">
    <input type="text">
  </div>
`

class ModalURLInput extends HTMLElement {
  static observedAttributes = ["placeholder", "name"]

  constructor() {
    super()
    const clone = template.content.cloneNode(true)
    this.root = this.attachShadow({ mode: "open" })
    this.root.append(clone)
    this.field = this.root.querySelector("input[type='text']")
    this.allowedKeys = /(\b|\.|\d|\/|Backspace|Tab)/i
    this.validationRegex = /^(?:www\.)?.{2,}\.\w{2,4}(?:\/.{0,24})?$/i
  }

  connectedCallback() {
    this.field.addEventListener("keydown", (e) => {
      if (!this.allowedKeys.test(e.key) || e.ctrlKey) e.preventDefault()
    })

    this.field.addEventListener("focusout", () => {
      if (this.validationRegex.test(this.value)) {
        const newValue = this.field.value.replace(/^www\./i, "")
        this.field.value = newValue
      } else {
        this.field.value = ""
      }
    })
  }

  attributeChangedCallback(attribute, oldValue, newValue) {
    this.changeFieldAttribute(attribute, newValue)
  }

  changeFieldAttribute(attribute, updatedValue) {
    this.field.setAttribute(attribute, updatedValue)
  }

  get value() {
    return this.field.value
  }

  set value(value) {
    this.field.value = value
  }
}

customElements.define("modal-url-input", ModalURLInput)

export default ModalURLInput
