const template = document.createElement("template")
template.innerHTML = `
  <style>
    @import url("../../css/style.css")
  </style>
  <div class="toolbar price-input site-code">
    <input type="text">
    <figure class="underline"></figure>
  </div>
`

class TextInput extends HTMLElement {
  static observedAttributes = ["placeholder", "name"]

  constructor() {
    super()
    const clone = template.content.cloneNode(true)
    this.root = this.attachShadow({ mode: "open" })
    this.root.append(clone)
    this.node = this.root.querySelector(".site-code")
    this.field = this.node.querySelector("input[type='text']")
    this.allowedKeys = /[a-z]|Backspace|Tab/i
    this.validationRegex = null
  }

  connectedCallback() {
    this.field.addEventListener("keydown", (e) => {
      if (!this.allowedKeys.test(e.key) || e.ctrlKey) e.preventDefault()
    })

    this.field.addEventListener("focusout", () => {
      if (this.validationRegex) {
        if (!this.validationRegex.test(this.field.value)) this.field.value = ""
      }
    })
  }

  attributeChangedCallback(attribute, oldValue, newValue) {
    this.changeFieldAttribute(attribute, newValue)
  }

  changeFieldAttribute(attribute, updatedValue) {
    this.field.setAttribute(attribute, updatedValue)
  }

  setAllowedKeys(regex) {
    this.allowedKeys = regex
  }

  setValidationRegex(regex) {
    this.validationRegex = regex
  }

  get value() {
    return this.field.value
  }

  set value(value) {
    this.field.value = value
  }
}

customElements.define("modal-text-input", TextInput)

export default TextInput
