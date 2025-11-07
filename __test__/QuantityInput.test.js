import QuantityInput from "../js/classes/QuantityInput.js"

document.body.innerHTML = `
  <div id="parent"></div>
`

describe("initial behavior", () => {
  let quantityInput
  const parent = document.querySelector("div#parent")

  beforeEach(() => {
    const customElement = document.createElement("quantity-input")
    quantityInput = customElement
    parent.append(customElement)
  })

  afterEach(() => {
    parent.innerHTML = ""
  })

  test("correct initial value", () => {
    customElements.whenDefined("quantity-input").then(() => {
      expect(quantityInput.numberLabel.textContent).toBe("0")
      expect(quantityInput.value).toBe(0)
    })
  })
})

describe("functionality", () => {
  let quantityInput
  const parent = document.querySelector("div#parent")

  beforeEach(() => {
    const customElement = document.createElement("quantity-input")
    quantityInput = customElement
    parent.append(customElement)
  })

  afterEach(() => {
    parent.innerHTML = ""
  })

  test("the label increments in value", () => {
    customElements.whenDefined("quantity-input").then(() => {
      quantityInput.addUp()

      expect(quantityInput.numberLabel.textContent).toBe("1")
      expect(quantityInput.value).toBe(1)
    })
  })

  it("prevents going above the max value", () => {
    customElements.whenDefined("quantity-input").then(() => {
      for (let i = 0; i < 15; i++) {
        quantityInput.addUp()
      }

      const maxValue = quantityInput.max.toString()
      expect(quantityInput.numberLabel.textContent).toBe(maxValue)
      expect(quantityInput.value).toBe(Number(maxValue))
    })
  })

  it("prevents going above the min value", () => {
    customElements.whenDefined("quantity-input").then(() => {
      for (let i = 0; i < 15; i++) {
        quantityInput.subtract()
      }

      const minValue = quantityInput.min.toString()
      expect(quantityInput.numberLabel.textContent).toBe(minValue)
      expect(quantityInput.value).toBe(Number(minValue))
    })
  })

  it("prevents setting an initial value that offsets max value", () => {
    customElements.whenDefined("quantity-input").then(() => {
      const initialValue = 50
      const maxValue = quantityInput.max.toString()

      quantityInput.setInitial(initialValue)

      expect(quantityInput.numberLabel.textContent).toBe(maxValue)
      expect(quantityInput.value).toBe(Number(maxValue))
    })
  })

  it("prevents setting an initial value that offsets min value", () => {
    customElements.whenDefined("quantity-input").then(() => {
      const initialValue = -10
      const minValue = quantityInput.min.toString()

      quantityInput.setInitial(initialValue)

      expect(quantityInput.numberLabel.textContent).toBe(minValue)
      expect(quantityInput.value).toBe(Number(minValue))
    })
  })
})
