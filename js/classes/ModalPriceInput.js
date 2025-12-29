const template = document.createElement("template")
template.innerHTML = `
  <style>
    @import url("../../css/style.css")
  </style>
  <div class="toolbar price-input">
    <input type="text" name="Price Input">
    <figure class="underline"></figure>
  </div>
`

class ModalPriceInput extends HTMLElement {
  static observedAttributes = ["placeholder", "name"]

  constructor() {
    super()
    const clone = template.content.cloneNode(true)
    this.root = this.attachShadow({ mode: "closed" })
    this.root.append(clone)
    this.field = this.root.querySelector("input[type='text']")
    this.field.dollars = "0"
    this.field.cents = "00"
    this.field.caret = null
  }

  connectedCallback() {
    this.field.addEventListener("keydown", (e) => {
      e.preventDefault()
      this.field.caret = e.target.selectionStart
      const validKeysRegex = /[0-9]|Backspace|Tab|\./i

      // When a valid key is typed
      if (validKeysRegex.test(e.key)) {
        // Was it a number?
        if (Number.parseInt(e.key) >= 0) {
          this.writeNumber(e.key)
        } else {
          this.checkOtherValidKey(e.key)
        }
      }
    })
  }

  attributeChangedCallback(attribute, oldValue, newValue) {
    this.changeFieldAttribute(attribute, newValue)
  }

  changeFieldAttribute(attribute, updatedValue) {
    this.field.setAttribute(attribute, updatedValue)
  }

  getNumberValue() {
    let start = this.field.value.indexOf("$")
    let end = this.field.value.indexOf(".")
    return this.field.value.substring(start + 1, end)
  }

  writeNumber(key) {
    const dollarsAndCents = this.field.dollars + "." + this.field.cents

    // Initial empty field
    if (this.field.dollars === "0") {
      this.field.dollars = key
      this.field.caret = 1
    }
    // When caret is on dollars section
    else if (this.field.caret < this.field.dollars.length) {
      // Caret is not at the final pos of dollars
      if (this.field.caret !== this.field.dollars.length) {
        const leftDigits = this.field.dollars.substr(0, this.field.caret)
        const rightDigits = this.field.dollars.substr(
          this.field.caret,
          this.field.dollars.length
        )
        this.field.dollars = leftDigits + key + rightDigits
        this.field.caret = this.field.caret
      } else {
        this.field.dollars =
          this.field.dollars[0] === "0" ? key : this.field.dollars + key
        this.field.caret = this.field.dollars.length
      }
    }
    // When caret is on cents section
    else if (
      this.field.caret > this.field.dollars.length &&
      this.field.caret < dollarsAndCents.length
    ) {
      if (this.field.caret === dollarsAndCents.length - 2) {
        // Caret will edit .nX
        this.field.cents = key + this.field.cents[1]
      } else if (this.field.caret === dollarsAndCents.length - 1) {
        // Caret will edit .Xn
        this.field.cents = this.field.cents[0] + key
        this.field.blur()
      }
      this.field.caret = this.field.caret + 1
    }
    // When caret is anywhere else
    else {
      this.field.dollars = this.field.dollars + key
      this.field.caret = this.field.dollars.length
    }

    this.rewrite()
  }

  checkOtherValidKey(key) {
    const nextChar = this.field.value[this.field.selectionStart]
    const dollarsAndCents = this.field.dollars + "." + this.field.cents

    switch (key) {
      case ".":
        if (nextChar === ".") {
          this.field.caret = this.field.caret + 1
          this.field.setSelectionRange(this.field.caret, this.field.caret)
        }
        break

      case "Backspace":
        if (
          this.field.caret > this.field.dollars.length &&
          this.field.caret < dollarsAndCents.length + 1
        ) {
          if (this.field.caret === dollarsAndCents.length - 1)
            // Caret will edit .0X
            this.field.cents = "0" + this.field.cents[1]
          else if (this.field.caret === dollarsAndCents.length)
            // Caret will edit .X0
            this.field.cents = this.field.cents[0] + "0"

          this.field.caret = this.field.caret - 1
        } else if (this.field.caret > dollarsAndCents.length) {
          this.field.dollars = this.field.dollars.substr(
            0,
            this.field.dollars.length - 1
          )
          this.field.caret = this.field.dollars.length
        } else {
          const leftDigits = this.field.dollars.substr(0, this.field.caret - 1)
          const rightDigits = this.field.dollars.substr(
            this.field.caret,
            this.field.dollars.length
          )
          this.field.dollars = leftDigits + rightDigits
          this.field.caret = this.field.caret - 1
        }

        this.rewrite()
        break
    }
  }

  rewrite() {
    this.field.value = this.field.dollars
      ? "$" + this.field.dollars + "." + this.field.cents + " MXN/MONTH"
      : ""
    this.field.setSelectionRange(this.field.caret, this.field.caret)
  }

  get value() {
    return this.field.value
  }

  set value(value) {
    this.field.dollars = Number.parseInt(value).toString()
    this.field.caret = value.length - 1
    this.rewrite()
  }
}

customElements.define("modal-price-input", ModalPriceInput)

export default ModalPriceInput
