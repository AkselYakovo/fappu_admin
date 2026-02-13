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

  test("correct initial value", async () => {
    await customElements.whenDefined("quantity-input")
    expect(quantityInput.numberLabel.textContent).toBe("0")
    expect(quantityInput.value).toBe(0)
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

  test("the label increments in value", async () => {
    await customElements.whenDefined("quantity-input")
    quantityInput.addUp()

    expect(quantityInput.numberLabel.textContent).toBe("1")
    expect(quantityInput.value).toBe(1)
  })

  it("prevents going above the max value", async () => {
    const maxValue = quantityInput.max.toString()

    await customElements.whenDefined("quantity-input")

    for (let i = 0; i < 15; i++) {
      quantityInput.addUp()
    }

    expect(quantityInput.numberLabel.textContent).toBe(maxValue)
    expect(quantityInput.value).toBe(Number(maxValue))
  })

  it("prevents going below the min value", async () => {
    const minValue = quantityInput.min.toString()

    await customElements.whenDefined("quantity-input")

    for (let i = 0; i < 15; i++) {
      quantityInput.subtract()
    }

    expect(quantityInput.numberLabel.textContent).toBe(minValue)
    expect(quantityInput.value).toBe(Number(minValue))
  })

  it("prevents setting an initial value that offsets max value", async () => {
    let quantityLabel
    const maxValue = 20
    const initialValue = 50

    await customElements.whenDefined("quantity-input")
    quantityInput.setMaximum(maxValue)
    quantityInput.setInitial(initialValue)

    quantityLabel = Number.parseInt(quantityInput.numberLabel.textContent)

    expect(quantityLabel).toBe(0)
    expect(quantityInput.value).toBe(0)

  })

  it("prevents setting an initial value that offsets min value", async () => {
    let quantityLabel
    const initialValue = -20
    const minValue = -10

    await customElements.whenDefined("quantity-input")
    quantityInput.setMinimum(minValue)
    quantityInput.setInitial(initialValue)

    quantityLabel = Number.parseInt(quantityInput.numberLabel.textContent)

    expect(quantityLabel).toBe(0)
    expect(quantityInput.value).toBe(0)

  })
})
