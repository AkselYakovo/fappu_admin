import { jest } from "@jest/globals"
import SelectVendor from "../js/classes/SelectVendor.js"

document.body.innerHTML = `
    <div id='parent'></div>
  `

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve([
        {
          ID: "TESTA",
          EMAIL: "jon@doe.gov",
        },
        {
          ID: "TESTB",
          EMAIL: "doen@jon.gov",
        },
      ]),
  })
)

describe("initial behavior", () => {
  const parent = document.getElementById("parent")
  let selectVendor

  beforeEach(() => {
    const customElement = document.createElement("select-vendor")
    customElement.setAttribute("id", "mockup")
    parent.appendChild(customElement)
    selectVendor = parent.querySelector("select-vendor")
  })

  afterEach(() => {
    parent.innerHTML = ""
  })

  test("<select-vendor> main node exists", () => {
    customElements
      .whenDefined("select-vendor")
      .then(expect(selectVendor.parent).toBeDefined())
  })
})

describe("functionality", () => {
  const parent = document.getElementById("parent")
  let selectVendor

  beforeEach(() => {
    const customElement = document.createElement("select-vendor")
    customElement.setAttribute("id", "mockup")
    parent.appendChild(customElement)
    selectVendor = parent.querySelector("select-vendor")
  })

  afterEach(() => {
    parent.innerHTML = ""
  })

  it("fetches vendors", () => {
    customElements.whenDefined("select-vendor").then(async () => {
      await selectVendor.fetchVendors("TEST")

      expect(selectVendor.vendorsArray.length).toBe(2)
    })
  })

  it("fills option list with the fetched values", () => {
    customElements.whenDefined("select-vendor").then(async () => {
      await selectVendor.fetchVendors("TEST")
      selectVendor.fillOptionsList()

      const firstOption =
        selectVendor.optionsList.childNodes[0].querySelector("span")
      expect(firstOption.textContent).toBe("@TESTA")
    })
  })
})
