import Select from "../js/classes/Select.js"

document.body.innerHTML = `
    <div id='parent'></div>
  `

describe("initial behavior", () => {
  let selectEmphasized
  const parent = document.getElementById("parent")

  beforeEach(() => {
    const customElement = document.createElement("select-emphasized")
    customElement.setAttribute("id", "mockup")
    parent.appendChild(customElement)
    selectEmphasized = parent.querySelector("select-emphasized")
  })

  afterEach(() => {
    parent.innerHTML = ""
  })

  test("<select-emphasized> main node does exist", () => {
    customElements
      .whenDefined("select-emphasized")
      .then(expect(selectEmphasized.node).toBeDefined())
  })

  it("has the default styles when no options have been supplied", () => {
    customElements.whenDefined("select-emphasized").then(() => {
      const listNode = selectEmphasized.node
      expect(listNode.classList.contains("selection--options-loading")).toBe(
        true
      )
    })
  })

  test("the initial label is set to 'SELECT'", () => {
    customElements.whenDefined("select-emphasized").then(() => {
      const label = selectEmphasized.node.label.innerHTML
      expect(label).toBe("SELECT")
    })
  })
})

describe("basic functionality", () => {
  let selectEmphasized
  const parent = document.getElementById("parent")
  const optionsList = [
    { SITE_CODE: "TST1", SITE_TITLE: "TESTONE" },
    { SITE_CODE: "TST2", SITE_TITLE: "TESTTWO" },
  ]

  beforeEach(() => {
    const customElement = document.createElement("select-emphasized")
    customElement.setAttribute("id", "mockup")
    parent.appendChild(customElement)
    selectEmphasized = parent.querySelector("select-emphasized")
  })

  afterEach(() => {
    parent.innerHTML = ""
  })

  it("changes the initial label", () => {
    customElements.whenDefined("select-emphasized").then(() => {
      selectEmphasized.setInitialLabel("TEST")

      const label = selectEmphasized.node.label
      expect(label.innerHTML).toBe("TEST")
    })
  })

  it("changes the default option", () => {
    customElements.whenDefined("select-emphasized").then(() => {
      selectEmphasized.setOptions(optionsList)
      selectEmphasized.setDefault("TST2")

      const label = selectEmphasized.node.label.innerHTML
      expect(label).toBe("TESTTWO")
    })
  })

  it("fails to change the default option (option non-existent)", () => {
    customElements.whenDefined("select-emphasized").then(() => {
      selectEmphasized.setOptions(optionsList)

      try {
        selectEmphasized.setDefault("INVALID")
      } catch (error) {
        expect(error).toBeDefined()
      }
    })
  })

  it("loads option list", () => {
    customElements.whenDefined("select-emphasized").then(() => {
      selectEmphasized.setOptions(optionsList)
      expect(selectEmphasized.node.list.children.length).toBe(2)
    })
  })

  it("rejects an invalid option list", () => {
    const invalidList = [{ SITE_CODE: "TST1" }, { SITE_CODE: "TST2" }]

    customElements.whenDefined("select-emphasized").then(() => {
      try {
        selectEmphasized.setOptions(invalidList)
      } catch (error) {
        expect(error).toBeDefined()
      }
    })
  })

  it("changes the styles when option list supplied", () => {
    customElements.whenDefined("select-emphasized").then(() => {
      selectEmphasized.setOptions(optionsList)

      expect(
        selectEmphasized.node.classList.contains("selection--options-loading")
      ).toBe(false)
    })
  })
})
