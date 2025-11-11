import { fireEvent } from "@testing-library/dom"
import ModalPriceInput from "../js/classes/ModalPriceInput.js"

document.body.innerHTML = `
  <div id="parent"></div>
`

describe("basic typing functionality", () => {
  const parent = document.getElementById("parent")
  let priceInput

  beforeEach(() => {
    const customElement = document.createElement("modal-price-input")
    priceInput = customElement
    parent.append(customElement)
  })

  afterEach(() => {
    parent.innerHTML = ""
  })

  test("typing of simple numbers", () => {
    customElements.whenDefined("modal-price-input").then(() => {
      const validInput = "123"
      const expectedValue = "123.00 MXN/MONTH"

      for (let i = 0; i < validInput.length; i++) {
        const char = validInput[i]

        fireEvent.keyDown(priceInput.field, {
          key: char,
          charCode: char.charCodeAt(0),
        })
      }

      expect(priceInput.value).toBe(expectedValue)
    })
  })

  test("typing of invalid characters", () => {
    customElements.whenDefined("modal-price-input").then(() => {
      const invalidInput = "ASD$123,,~@#&*"
      const expectedValue = "123.00 MXN/MONTH"

      for (let i = 0; i < invalidInput.length; i++) {
        const char = invalidInput[i]

        fireEvent.keyDown(priceInput.field, {
          key: char,
          charCode: char.charCodeAt(0),
        })
      }

      expect(priceInput.value).toBe(expectedValue)
    })
  })

  test("typing a valid number then remove a few characters", () => {
    customElements.whenDefined("modal-price-input").then(() => {
      const initialInput = "890"
      const lastInput = "75"
      const expectedValue = "875.00 MXN/MONTH"

      for (let i = 0; i < initialInput.length; i++) {
        const char = initialInput[i]

        fireEvent.keyDown(priceInput.field, {
          key: char,
          charCode: char.charCodeAt(0),
        })
      }

      for (let i = 0; i < 2; i++) {
        fireEvent.keyDown(priceInput.field, {
          key: "Backspace",
          charCode: 0,
        })
      }

      for (let i = 0; i < lastInput.length; i++) {
        const char = lastInput[i]

        fireEvent.keyDown(priceInput.field, {
          key: char,
          charCode: char.charCodeAt(0),
        })
      }

      expect(priceInput.value).toBe(expectedValue)
    })
  })

  test("typing decimal numbers", () => {
    customElements.whenDefined("modal-price-input").then(() => {
      const invalidInput = "123.45"
      const expectedValue = "123.45 MXN/MONTH"

      for (let i = 0; i < invalidInput.length; i++) {
        const char = invalidInput[i]

        fireEvent.keyDown(priceInput.field, {
          key: char,
          charCode: char.charCodeAt(0),
        })
      }

      expect(priceInput.value).toBe(expectedValue)
    })
  })
})

describe("edge-cases typing functionality", () => {
  const parent = document.getElementById("parent")
  let priceInput

  beforeEach(() => {
    const customElement = document.createElement("modal-price-input")
    priceInput = customElement
    parent.append(customElement)
  })

  afterEach(() => {
    parent.innerHTML = ""
  })

  test("leading zeroes and then a normal number", () => {
    customElements.whenDefined("modal-price-input").then(() => {
      const leadingZeroes = "000"
      const validInput = "123"
      const expectedValue = "123.00 MXN/MONTH"

      for (let i = 0; i < leadingZeroes.length; i++) {
        const char = leadingZeroes[i]

        fireEvent.keyDown(priceInput.field, {
          key: char,
          charCode: char.charCodeAt(0),
        })
      }

      for (let i = 0; i < validInput.length; i++) {
        const char = validInput[i]

        fireEvent.keyDown(priceInput.field, {
          key: char,
          charCode: char.charCodeAt(0),
        })
      }

      expect(priceInput.value).toBe(expectedValue)
    })
  })

  test("typing when caret is off position", () => {
    customElements.whenDefined("modal-price-input").then(() => {
      const initialValue = "1"
      const validInput = "23"
      const expectedValue = "123.00 MXN/MONTH"

      priceInput.value = initialValue
      fireEvent.focus(priceInput.field)
      priceInput.field.setSelectionRange(
        priceInput.value.length,
        priceInput.value.length
      )

      for (let i = 0; i < validInput.length; i++) {
        const char = validInput[i]

        fireEvent.keyDown(priceInput.field, {
          key: char,
          charCode: char.charCodeAt(0),
        })
      }

      expect(priceInput.value).toBe(expectedValue)
    })
  })

  test("typing when caret is on decimal position", () => {
    customElements.whenDefined("modal-price-input").then(() => {
      let decimalPointPos
      const initialValue = "123"
      const decimalValue = "45"
      const expectedValue = "123.45 MXN/MONTH"

      priceInput.value = initialValue
      decimalPointPos = priceInput.field.value.indexOf(".")

      fireEvent.focus(priceInput.field)
      priceInput.field.setSelectionRange(decimalPointPos, decimalPointPos)

      fireEvent.keyDown(priceInput.field, {
        key: ".",
        charCode: ".".charCodeAt(0),
      })

      for (let i = 0; i < decimalValue.length; i++) {
        const char = decimalValue[i]

        fireEvent.keyDown(priceInput.field, {
          key: char,
          charCode: char.charCodeAt(0),
        })
      }

      expect(priceInput.value).toBe(expectedValue)
    })
  })
})
