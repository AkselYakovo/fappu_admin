describe("basic functionality", () => {
  beforeEach(() => {
    cy.visit(Cypress.env("NEWSUBSITEMODAL_MOCKUP_URI"))
    cy.get("new-subsite-modal", { timeout: 5000 })
    cy.get("button.open").click().wait(1000)
  })

  it("exists (main node)", () => {
    cy.get("body").find("new-subsite-modal").should("exist")
  })

  it("opens and closes", () => {
    cy.get("new-subsite-modal")
      .shadow()
      .find("div#New-Children-Website-Modal")
      .should("be.visible")
      .wait(500)

    cy.get("new-subsite-modal")
      .shadow()
      .find("div#New-Children-Website-Modal + div")
      .trigger("click", { force: true })

    cy.wait(1000)

    cy.get("new-subsite-modal")
      .shadow()
      .find("div#New-Children-Website-Modal")
      .should("not.be.visible")

    cy.get("new-subsite-modal")
      .shadow()
      .find("div#New-Children-Website-Modal + div")
      .should("not.be.visible")
  })

  it("prevents form submision when fields are invalid", () => {
    cy.get("new-subsite-modal").then(($modal) => {
      const modal = $modal[0]
      const formSubmit = cy.stub(modal, "submit").as("formSubmitMethod")

      cy.wait(1000)
      cy.wrap($modal).shadow().find("button.add").should("exist")
      cy.wrap($modal).shadow().find("button.add").click()
      cy.get("@formSubmitMethod").should("not.have.been.called")
    })
  })

  it("flushes out the fields data", () => {
    const validPicture = "../fixtures/validPicture.jpg"
    const validLogoPicture = "../fixtures/validLogo.png"

    cy.get("new-subsite-modal").then(($modal) => {
      cy.wrap($modal)
        .shadow()
        .find("modal-text-input[name='Subsite Title']")
        .shadow()
        .find("input")
        .type("TEST", { delay: 25 })

      cy.wrap($modal)
        .shadow()
        .find("input[name='Logo']")
        .attachFile(validLogoPicture)

      cy.wrap($modal)
        .shadow()
        .find("modal-picture-input[name='Subsite Picture']")
        .shadow()
        .find("input[type='file']")
        .attachFile(validPicture)
    })

    cy.wait(1000)

    cy.get("new-subsite-modal").then(($modal) => {
      const modal = $modal[0]

      modal.flush()
      modal.close()
    })

    cy.get("new-subsite-modal")
      .shadow()
      .find("modal-text-input[name='Subsite Title']")
      .shadow()
      .find("input")
      .should("contain.value", "")

    cy.get("new-subsite-modal")
      .shadow()
      .find("modal-picture-input")
      .then(($pictureInput) => {
        const pictureInput = $pictureInput[0]

        expect(pictureInput.file).to.be.null
      })

    cy.get("new-subsite-modal")
      .then($modal => {
        const modal = $modal[0]

        expect(modal.logoFile).to.be.null
      })
  })
})
