import { userEvent } from "@testing-library/user-event"
import ModalTextInput from "../js/classes/ModalTextInput.js"

document.body.innerHTML = `
  <div id="parent"></div>
`

describe("initial behavior", () => {
  let textInput
  const parent = document.querySelector("div#parent")
  const placeholderText = "PL@CEHOLDER"
  const textFieldName = "NAME"

  beforeEach(() => {
    const customElement = document.createElement("modal-text-input")
    customElement.setAttribute("placeholder", placeholderText)
    customElement.setAttribute("name", textFieldName)
    textInput = customElement
    parent.append(customElement)
  })

  afterEach(() => {
    parent.innerHTML = ""
  })

  it("sets correct placeholder string", () => {
    customElements.whenDefined("modal-text-input").then(() => {
      const placeholder = textInput.field.getAttribute("placeholder")

      expect(placeholder).toBe(placeholderText)
    })
  })

  it("sets correct field's name", () => {
    customElements.whenDefined("modal-text-input").then(() => {
      const fieldName = textInput.field.getAttribute("name")

      expect(fieldName).toBe(textFieldName)
    })
  })

  it("sets value correctly", () => {
    customElements.whenDefined("modal-text-input").then(() => {
      const initialValue = "DEFAULT"

      textInput.value = initialValue

      expect(textInput.field.value).toBe(initialValue)
    })
  })
})

describe("default functionality", () => {
  let textInput
  const parent = document.querySelector("div#parent")

  beforeEach(() => {
    const customElement = document.createElement("modal-text-input")
    textInput = customElement
    parent.append(customElement)
  })

  afterEach(() => {
    parent.innerHTML = ""
  })

  test("typing of a valid string", async () => {
    const validString = "TEST"

    await customElements.whenDefined("modal-text-input").then(async () => {
      await userEvent.type(textInput.field, validString, {
        delay: 25,
      })

      expect(textInput.field.value).toBe(validString)
    })
  })

  test("typing of valid keys", async () => {
    const validString = "TEST"

    await customElements.whenDefined("modal-text-input").then(async () => {
      await userEvent.type(textInput.field, validString, {
        delay: 25,
      })

      // trigger three keystrokes of Backspace
      await userEvent.type(textInput.field, "{Backspace}")
      await userEvent.type(textInput.field, "{Backspace}")
      await userEvent.type(textInput.field, "{Backspace}")

      expect(textInput.field.value).toBe(
        validString.substring(0, validString.length - 3)
      )
    })
  })

  test("typing of invalid keys", async () => {
    const invalidString = "TE3ST STR!NG@"
    const finalString = "TESTSTRNG"

    await customElements.whenDefined("modal-text-input").then(async () => {
      await userEvent.type(textInput.field, invalidString, {
        delay: 25,
      })

      expect(textInput.field.value).toBe(finalString)
    })
  })
})

describe("custom functionality", () => {
  let textInput
  const parent = document.querySelector("div#parent")

  beforeEach(() => {
    const customElement = document.createElement("modal-text-input")
    textInput = customElement
    parent.append(customElement)
  })

  afterEach(() => {
    parent.innerHTML = ""
  })

  it("sets custom accepted keys", async () => {
    const string = "TEST $TRING@"
    await customElements.whenDefined("modal-text-input").then(async () => {
      const validKeys = /\s|[a-z]|@|\$|Backspace/i

      textInput.setAllowedKeys(validKeys)

      await userEvent.type(textInput.field, string)

      expect(textInput.field.value).toBe(string)
    })
  })

  it("sets a custom validation Regex", async () => {
    const validationRegex = /$\w{4,8}^/i
    const validString = "TEST"
    const invalidString = "LONGSTRING"

    await customElements.whenDefined("modal-text-input").then(async () => {
      textInput.setValidationRegex(validationRegex)

      await userEvent.type(textInput.field, invalidString, {})
      await userEvent.tab()

      expect(textInput.field.value).toBe("")

      // get rid of existing previous string
      for await (let i of Array.from({ length: invalidString.length }))
        await userEvent.type(textInput.field, "{Backspace}")

      await userEvent.type(textInput.field, validString)

      expect(textInput.field.value).toBe(validString)
    })
  })
})
