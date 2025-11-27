describe("basic functionality", () => {
  beforeEach(() => {
    cy.visit(Cypress.env("NEWWEBSITEMODAL_MOCKUP_URI"))
    cy.get("new-website-modal", { timeout: 5000 })
    cy.get("button.open").click().wait(1000)
  })

  it("exists (main node)", () => {
    cy.get("body").find("new-website-modal").should("exist")
  })

  it("opens and closes", () => {
    cy.get("new-website-modal")
      .shadow()
      .find("div#New-Website-Modal")
      .should("be.visible")
      .wait(500)

    cy.get("new-website-modal")
      .shadow()
      .find("div#New-Website-Modal + div")
      .trigger("click", { force: true })

    cy.wait(1000)

    cy.get("new-website-modal")
      .shadow()
      .find("div#New-Website-Modal")
      .should("not.be.visible")

    cy.get("new-website-modal")
      .shadow()
      .find("div#New-Website-Modal + div")
      .should("not.be.visible")
  })

  it("prevents form submision when fields are invalid", () => {
    cy.get("new-website-modal").then(($modal) => {
      const modal = $modal[0]
      const formSubmit = cy.stub(modal, "submit").as("formSubmitMethod")

      modal.showSecondStage()

      cy.wait(1000)
      cy.wrap($modal).shadow().find("button.next").should("exist")
      cy.wrap($modal).shadow().find("button.next").click()
      cy.get("@formSubmitMethod").should("not.have.been.called")
    })
  })

  it("shows second stage when next button is pressed", () => {
    cy.get("new-website-modal").then(($modal) => {
      const modal = $modal[0]
      const formSubmit = cy.stub(modal, "submit").as("formSubmitMethod")

      cy.wrap($modal).shadow().find("button.next").should("exist")
      cy.wrap($modal).shadow().find("button.next").click()
      cy.wrap($modal)
        .shadow()
        .find(".phases .phase:nth-child(2)")
        .should("have.class", "phase--active")
    })
  })

  it("flushes out the fields data", () => {
    const validPicture = "../fixtures/validPicture.jpg"

    cy.get("new-website-modal").then(($modal) => {
      cy.wrap($modal)
        .shadow()
        .find("header modal-text-input")
        .shadow()
        .find("input")
        .type("TEST", { delay: 25 })

      cy.wrap($modal)
        .shadow()
        .find(".carousel modal-picture-input:nth-child(1)")
        .shadow()
        .find("input[type='file']")
        .attachFile(validPicture)
    })

    cy.wait(1000)

    cy.get("new-website-modal").then(($modal) => {
      const modal = $modal[0]

      modal.flush()
      modal.close()
    })

    cy.get("button.open").click()

    cy.get("new-website-modal")
      .shadow()
      .find("modal-text-input[name='Sitecode']")
      .shadow()
      .find("input")
      .should("contain.value", "")

    cy.get("new-website-modal")
      .shadow()
      .find(".carousel modal-picture-input:nth-child(1)")
      .then(($pictureInput) => {
        const pictureInput = $pictureInput[0]

        expect(pictureInput.file).to.be.null
      })
  })

  it("traverses carrousel", () => {
    cy.get("new-website-modal")
      .shadow()
      .find(".controls .control:nth-child(2)")
      .click()
      .wait(500)
    cy.get("new-website-modal")
      .shadow()
      .find(".controls .control:nth-child(3)")
      .click()
      .wait(500)
    cy.get("new-website-modal")
      .shadow()
      .find(".controls .control:nth-child(1)")
      .click()

    cy.get("new-website-modal")
      .shadow()
      .find(".controls .control:nth-child(1)")
      .should("have.class", "active")
  })
})

describe.skip("ideal user interaction", () => {
  beforeEach(() => {
    cy.visit(Cypress.env("NEWWEBSITEMODAL_MOCKUP_URI"))
    cy.get("new-website-modal", { timeout: 5000 })
    cy.get("button.open").click().wait(1000)
  })

  /**
   * - it prevents data submission while there exists invalid or missing fields
   * - submits data once everything is filled correctly
   */
  it("submits data when everything is filled correctly", () => {
    const validPicture = "../fixtures/validPicture.jpg"
    const siteCode = "TEST"
    const URL = "www.test.io"
    const price = "99.99"
    const title = "TESTTITLE"

    cy.get("new-website-modal").then(($modal) => {
      const modal = $modal[0]
      const formSubmitMethod = cy.stub(modal, "submit").as("formSubmitMethod")

      // filling site code field
      cy.wrap($modal)
        .shadow()
        .find("modal-text-input[name='Sitecode']")
        .shadow()
        .find("input[type='text']")
        .type(siteCode, { delay: 100, force: true })

      cy.wrap($modal).shadow().find("button.next").click()

      cy.get("@formSubmitMethod").should("not.have.been.called")

      // filling first price input field
      cy.wrap($modal)
        .shadow()
        .find("modal-price-input[name='Normal Montly Price']")
        .shadow()
        .find("input[type='text']")
        .type(price, { delay: 100, force: true })

      cy.wrap($modal).shadow().find("button.next").click()

      cy.get("@formSubmitMethod").should("not.have.been.called")
    })
  })
})
