describe("basic functionality", () => {
  before(() => {
    cy.intercept("POST", Cypress.env("API_HUB_URI"), (req) => {
      req.reply([
        {
          ID: "TEST_A",
          SITE_TITLE: "TESTA",
          SITE_CODE: "TEST",
        },
        {
          ID: "TEST_B",
          SITE_TITLE: "TESTB",
          SITE_CODE: "TESTB",
        },
        {
          ID: "TEST_C",
          SITE_TITLE: "TESTC",
          SITE_CODE: "TESTC",
        },
        {
          ID: "TEST_D",
          SITE_TITLE: "TESTD",
          SITE_CODE: "TESTD",
        },
      ])
    })
  })

  beforeEach(() => {
    cy.visit(Cypress.env("NEWACCOUNTMODAL_MOCKUP_URI"))
    cy.get("new-account-modal", { timeout: 5000 })
    cy.get("button.open").click().wait(1000)
  })

  it("exists (main node)", () => {
    cy.get("body").find("new-account-modal").should("exist")
  })

  it("opens and closes", () => {
    cy.get("new-account-modal")
      .shadow()
      .find("div#New-Account-Modal")
      .should("be.visible")
      .wait(500)

    cy.get("new-account-modal")
      .shadow()
      .find("div#New-Account-Modal + div")
      .trigger("click", { force: true })

    cy.wait(1000)

    cy.get("new-account-modal")
      .shadow()
      .find("div#New-Account-Modal")
      .should("not.be.visible")

    cy.get("new-account-modal")
      .shadow()
      .find("div#New-Account-Modal + div")
      .should("not.be.visible")
  })

  it("fetches websites list", () => {
    cy.get("new-account-modal")
      .shadow()
      .find("select-emphasized")
      .then(($select) => {
        const select = $select[0]

        expect(select.node.list.children).to.not.be.empty
      })
  })

  it("transitions between phases", () => {
    cy.get("new-account-modal").then(($modal) => {
      cy.wrap($modal).shadow().find("button.next-button").should("exist")
      cy.wrap($modal).shadow().find("button.previous-button").should("exist")

      cy.wait(200)
      cy.wrap($modal).shadow().find("button.next-button").click()
      cy.wait(200)
      cy.wrap($modal).shadow().find("button.next-button").click()
      cy.wait(200)
      cy.wrap($modal).shadow().find("button.next-button").click()
      cy.wait(200)
      cy.wrap($modal).shadow().find("button.previous-button").click()
      cy.wait(200)
      cy.wrap($modal).shadow().find("button.next-button").click()
      cy.wait(200)
      cy.wrap($modal).shadow().find("button.next-button").click()
      cy.wait(200)
      cy.wrap($modal).shadow().find("button.previous-button").click()
      cy.wait(200)

      cy.wrap($modal).shadow().find(".phases .fourth").should("be.visible")
    })
  })

  it("prevents form submision when fields are invalid", () => {
    cy.get("new-account-modal").then(($modal) => {
      const modal = $modal[0]
      const formSubmit = cy.stub(modal, "submit").as("formSubmitMethod")

      cy.wrap($modal).shadow().find("button.next-button").should("exist")
      cy.wait(200)
      cy.wrap($modal).shadow().find("button.next-button").click()
      cy.wait(200)
      cy.wrap($modal).shadow().find("button.next-button").click()
      cy.wait(200)
      cy.wrap($modal).shadow().find("button.next-button").click()
      cy.wait(200)
      cy.wrap($modal).shadow().find("button.next-button").click()
      cy.wait(200)
      cy.wrap($modal).shadow().find("button.next-button").click()
      cy.wait(200)
      cy.wrap($modal).shadow().find("button.next-button").click()
      cy.wait(200)
      cy.wrap($modal).shadow().find("button.next-button").click()

      cy.get("@formSubmitMethod").should("not.have.been.called")
    })
  })

  it("flushes data out (regular elements)", () => {
    const nickname = "johnnyDoe"
    const password = "superman"
    const mockupDate = "2025-01-01"

    cy.get("new-account-modal").then(($modal) => {
      cy.wrap($modal).shadow().find("button.next-button").click()
      cy.wait(500)

      cy.wrap($modal)
        .shadow()
        .find("input.LL[name='Nickname']")
        .focus()
        .type(nickname, { delay: 25 })
      cy.wait(500)
      cy.wrap($modal)
        .shadow()
        .find("input.LL[name='Password']")
        .focus()
        .type(password, { delay: 25 })
      cy.wait(500)
      cy.wrap($modal).shadow().find("button.next-button").click()
      cy.wait(500)
      cy.wrap($modal).shadow().find("button.next-button").click()
      cy.wait(500)
      cy.wrap($modal).shadow().find("button.next-button").click()
      cy.wait(500)
      cy.wrap($modal).shadow().find("button.next-button").click()
      cy.wait(500)
      cy.wrap($modal)
        .shadow()
        .find("input.LL[name='Warranty Begins']")
        .focus()
        .type(mockupDate, { delay: 25 })
    })

    cy.wait(500)

    cy.get("new-account-modal").then(($modal) => {
      const modal = $modal[0]
      modal.flush()
    })

    cy.get("new-account-modal").then(($modal) => {
      cy.wrap($modal)
        .shadow()
        .find("input.LL[name='Nickname']")
        .should("be.empty")
      cy.wrap($modal)
        .shadow()
        .find("input.LL[name='Password']")
        .should("be.empty")
      cy.wrap($modal)
        .shadow()
        .find("input.LL[name='Warranty Begins']")
        .should("be.empty")
    })
  })

  it("flushes data out (custom elements)", () => {
    const price = "99.99"
    const vendor = "TEST"
    /**
     * Filling of custom elements
     */
    cy.get("new-account-modal")
      .shadow()
      .find("select-emphasized")
      .click()
      .then(($select) => {
        const select = $select[0]
        const firstOption = select.node.list.children[0]
        firstOption.click()
        expect(select.optionChosen.title).to.equal(firstOption.textContent)
      })

    cy.get("new-account-modal")
      .shadow()
      .find("button.next-button")
      .click()
      .wait(500)
      .click()

    cy.get("new-account-modal")
      .shadow()
      .find("modal-price-input")
      .shadow()
      .find("input")
      .type(price, { delay: 25 })
      .wait(500)

    cy.get("new-account-modal")
      .shadow()
      .find("button.next-button")
      .click()
      .wait(500)
      .click()
      .wait(500)

    cy.get("new-account-modal")
      .shadow()
      .find("select-vendor")
      .shadow()
      .find("input")
      .type(vendor, { delay: 25 })
      .wait(3000)

    cy.get("new-account-modal")
      .shadow()
      .find("select-vendor")
      .then(($vendorSelect) => {
        const vendorSelect = $vendorSelect[0]
        const firstOption = vendorSelect.optionsList.children[0]

        firstOption.click()
      })
      .wait(500)

    /**
     * Flushing out modal's data
     */
    cy.get("new-account-modal").then(($modal) => {
      const modal = $modal[0]

      modal.flush()
    })

    /**
     * Checking out custom elements state
     */
    cy.get("new-account-modal")
      .shadow()
      .find("select-emphasized")
      .then(($select) => {
        const select = $select[0]
        expect(select.optionChosen).to.be.null
      })

    cy.get("new-account-modal")
      .shadow()
      .find("modal-price-input")
      .then(($input) => {
        const input = $input[0]
        expect(input.value).to.be.null
      })

    cy.get("new-account-modal")
      .shadow()
      .find("select-vendor")
      .then(($selectVendor) => {
        const selectVendor = $selectVendor[0]
        expect(selectVendor.value).to.be.null
      })
  })
})
