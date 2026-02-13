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

  test("<select-emphasized> main node does exist", async () => {
    await customElements.whenDefined("select-emphasized")
    expect(selectEmphasized.node).toBeDefined()
  })

  it("has the default styles when no options have been supplied", async () => {
    await customElements.whenDefined("select-emphasized")
    const listNode = selectEmphasized.node
    expect(listNode.classList.contains("selection--options-loading")).toBe(true)
  })

  test("the initial label is set to 'SELECT'", async () => {
    await customElements.whenDefined("select-emphasized")
    const label = selectEmphasized.node.label.innerHTML
    expect(label).toBe("SELECT")
  })
})

describe("basic functionality", () => {
  let selectEmphasized
  const parent = document.getElementById("parent")
  const optionsList = [
    { SITE_CODE: "TST1", SITE_TITLE: "TESTONE" },
    { SITE_CODE: "TST2", SITE_TITLE: "TESTTWO" },
    { SITE_CODE: "TST3", SITE_TITLE: "TESTTHR" }
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

  it("changes the initial label", async () => {
    await customElements.whenDefined("select-emphasized")
    selectEmphasized.setInitialLabel("TEST")
    const label = selectEmphasized.node.label

    expect(label.innerHTML).toBe("TEST")
  })

  it("changes the default option", async () => {
    await customElements.whenDefined("select-emphasized")
    selectEmphasized.setOptions(optionsList)
    selectEmphasized.setDefault("TST2")
    const label = selectEmphasized.node.label.innerHTML

    expect(label).toBe("TESTTWO")
  })

  it("fails to change the default option (option non-existent)", async () => {
    await customElements.whenDefined("select-emphasized")
    selectEmphasized.setOptions(optionsList)

    try {
      selectEmphasized.setDefault("INVALID")
    } catch (error) {
      expect(error).toBeDefined()
    }
  })

  it("loads option list", async () => {
    await customElements.whenDefined("select-emphasized")
    selectEmphasized.setOptions(optionsList)

    expect(selectEmphasized.node.list.children.length).toBe(3)
  })

  it("rejects an invalid option list", async () => {
    const invalidList = [{ SITE_CODE: "TST1" }, { SITE_CODE: "TST2" }]

    await customElements.whenDefined("select-emphasized")

    try {
      selectEmphasized.setOptions(invalidList)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })

  it("changes the styles when option list supplied", async () => {
    await customElements.whenDefined("select-emphasized")
    selectEmphasized.setOptions(optionsList)

    expect(
      selectEmphasized.node.classList.contains("selection--options-loading")
    ).toBe(false)
  })
})
