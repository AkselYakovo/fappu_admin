import { fireEvent } from "@testing-library/dom"
import { userEvent } from "@testing-library/user-event"
import ModalURLInput from "../js/classes/ModalURLInput.js"

document.body.innerHTML = `
  <div id="parent"></div>
`

describe("functionality", () => {
  const parent = document.querySelector("div#parent")
  let url_input

  beforeEach(() => {
    const customElement = document.createElement("modal-url-input")
    url_input = customElement
    parent.append(customElement)
  })

  afterEach(() => {
    parent.innerHTML = ""
  })

  test("typing of a valid string", async () => {
    const validString = "testwebsite.com"

    await customElements.whenDefined("modal-url-input").then(async () => {
      await userEvent.type(url_input.field, validString, {
        delay: 25,
      })

      expect(url_input.field.value).toBe(validString)
    })
  })

  test("typing invalid characters", async () => {
    const invalidString = "!test#website^&.com)"
    const expectedString = "testwebsite.com"

    await customElements.whenDefined("modal-url-input").then(async () => {
      await userEvent.type(url_input.field, invalidString, {
        delay: 25,
      })
      expect(url_input.field.value).toBe(expectedString)
    })
  })

  it("prevents pasting values", () => {
    customElements.whenDefined("modal-url-input").then(() => {
      let hasBeenPasted = false

      url_input.field.addEventListener("paste", () => {
        hasBeenPasted = true
      })

      fireEvent.keyDown(url_input.field, {
        key: "v",
        code: "keyV",
        ctrlKey: true,
      })

      fireEvent.paste(url_input.field, {
        clipboardData: {
          getData: () => "PASTED VALUE",
        },
      })

      expect(hasBeenPasted).toBe(true)
      expect(url_input.value).toBe("")
    })
  })

  it("whipes out invalid strings", async () => {
    const invalidString = "teststring.c"
    await customElements.whenDefined("modal-url-input").then(async () => {
      await userEvent.type(url_input.field, invalidString, {
        delay: 25,
      })

      await userEvent.tab() // Trigger focusout event

      expect(url_input.field.value).toBe("")
    })
  })
})
