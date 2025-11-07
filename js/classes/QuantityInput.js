const template = document.createElement("template")
template.innerHTML = `
<style>
  @import url("../../css/style.css");
</style>

<div class="toolbar offer-input">
  <button class="button-primary round" name="minus">
    <svg width="15" height="13" viewBox="0 0 15 13" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 6V8H8V6H0ZM15 13H13V2.38L10 3.4V1.7L14.7 0H15V13Z"/>
    </svg>
  </button>
  <span class="counter">0</span>
  <button class="button-primary round" name="add">
    <svg width="16" height="13" viewBox="0 0 16 13" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 2H4V6H0V8H4V12H6V8H10V6H6V2ZM16 13H14V2.38L11 3.4V1.7L15.7 0H16V13Z"/>
    </svg>
  </button>
</div>
`
class QuantityInput extends HTMLElement {
  static observedAttributes = ["initial", "max", "min"]
  constructor() {
    super()
    const clone = template.content.cloneNode(true)
    this.root = this.attachShadow({ mode: "closed" })
    this.root.append(clone)
    this.numberLabel = this.root.querySelector("span.counter")
    this.additionButton = this.root.querySelector("button[name='add']")
    this.subtractionButton = this.root.querySelector("button[name='minus']")

    this.max = 10
    this.min = 0
    this.currentValue = 0
  }

  connectedCallback() {
    this.additionButton.addEventListener("click", () => this.addUp())
    this.subtractionButton.addEventListener("click", () => this.subtract())
  }

  attributeChangedCallback(attribute, oldValue, newValue) {
    if (attribute == "min") this.setMinimum(newValue)
    else if (attribute == "max") this.setMaximum(newValue)
    else if (attribute == "initial") this.setInitial(newValue)
  }

  addUp() {
    const futureValue = this.currentValue + 1

    if (futureValue <= this.max) {
      this.currentValue++

      if (futureValue > this.min) {
        this.subtractionButton.removeAttribute("disabled")
      }
    }

    if (this.currentValue == this.max) {
      this.additionButton.setAttribute("disabled", "true")
    }

    this.updateNumberLabel()
  }

  isValid() {
    if (this.currentValue > this.min && this.currentValue <= this.max) {
      return true
    }

    return false
  }

  setInitial(value) {
    const parsedInt = Number.parseInt(value)
    if (!Number.isFinite(parsedInt)) return

    this.currentValue = parsedInt
    this.numberLabel.innerHTML = parsedInt
  }

  setMaximum(value) {
    const parsedInt = Number.parseInt(value)
    if (!Number.isFinite(parsedInt)) return

    if (parsedInt < this.min) return
    this.max = parsedInt
  }

  setMinimum(value) {
    const parsedInt = Number.parseInt(value)
    if (!Number.isFinite(parsedInt)) return

    if (parsedInt > this.max) return
    this.min = parsedInt
  }

  subtract() {
    const futureValue = this.currentValue - 1

    if (futureValue >= this.min) {
      this.currentValue--

      if (this.additionButton.hasAttribute("disabled")) {
        this.additionButton.removeAttribute("disabled")
      }
    }

    if (this.currentValue == this.min) {
      this.subtractionButton.setAttribute("disabled", "true")
    }

    this.updateNumberLabel()
  }

  updateNumberLabel() {
    this.numberLabel.innerHTML = this.currentValue
  }

  get value() {
    return this.currentValue
  }

  set value(newValue) {
    const parsedInt = Number.parseInt(newValue)
    if (!Number.isFinite(parsedInt)) return

    if (parsedInt > this.min && parsedInt <= this.max) {
      this.currentValue = parsedInt
      this.updateNumberLabel()
    }
  }
}

customElements.define("quantity-input", QuantityInput)

export default QuantityInput
