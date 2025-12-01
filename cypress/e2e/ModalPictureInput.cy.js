describe("initial behavior", () => {
  beforeEach(() => {
    cy.visit(Cypress.env("MODALPICTUREINPUT_MOCKUP_URI"))
  })

  it("finds custom element root node", async () => {
    cy.get("body").find("modal-picture-input").should("exist")
  })

  it("finds the file input button", () => {
    cy.get("body")
      .find("modal-picture-input")
      .shadow()
      .find("button.input")
      .should("exist")
  })

  it("uploads a file", () => {
    const pictureFilePath = "../fixtures/validPicture.jpg"
    cy.get("modal-picture-input")
      .shadow()
      .find("input[type='file']")
      .attachFile(pictureFilePath)

    cy.get("modal-picture-input").shadow().find("img.image").should("be.visible")
  })

  it("prevents uploading an invalid file", () => {
    const pictureFilePath = "../fixtures/invalidPicture.webp"
    cy.get("modal-picture-input")
      .shadow()
      .find("input[type='file']")
      .attachFile(pictureFilePath)

    cy.get("modal-picture-input").shadow().find("img.image").should("not.be.visible")
  })
})

describe("user interaction", () => {
  beforeEach(() => {
    const pictureFilePath = "../fixtures/validPicture.jpg"

    cy.visit(Cypress.env("MODALPICTUREINPUT_MOCKUP_URI"))
    cy.get("modal-picture-input", { timeout: 5000 })
      .shadow()
      .find("input[type='file']")
      .attachFile(pictureFilePath)
  })

  it("zooms in", () => {
    for (let i = 0; i < 15; i++) {
      cy.get("body", { timeout: 30000 })
        .find("modal-picture-input")
        .shadow()
        .find(".controls button.zoom-in")
        .click()
    }
  })

  it("zooms out", () => {
    for (let i = 0; i < 5; i++) {
      cy.get("body")
        .find("modal-picture-input")
        .shadow()
        .find(".controls button.zoom-in")
        .click()
    }

    for (let i = 0; i < 5; i++) {
      cy.get("body")
        .find("modal-picture-input")
        .shadow()
        .find(".controls button.zoom-out")
        .click()
    }
  })

  it("snaps to parent's edge", () => {
    cy.wait(1000)
    cy.get("body")
      .find("modal-picture-input")
      .shadow()
      .find("img")
      .trigger("mousedown", {
        clientX: 365,
        clientY: 25,
      })

    cy.document("body")
      .trigger("mousemove", {
        clientX: 500,
        clientY: 150,
      })
      .wait(2000)
      .trigger("mouseup", { force: true })

    cy.wait(500)

    cy.get("modal-picture-input").then(($element) => {
      const elementCoords = $element[0].getBoundingClientRect()
      const elementCoordX = elementCoords.x
      const elementCoordY = elementCoords.y

      cy.wrap($element)
        .shadow()
        .find("img.image")
        .then(($image) => {
          const imageCoords = $image[0].getBoundingClientRect()
          const imageCoordX = imageCoords.x
          const imageCoordY = imageCoords.y

          expect(imageCoordX).to.equal(elementCoordX)
          expect(imageCoordY).to.equal(elementCoordY)
        })
    })
  })

  it("removes image", () => {
    cy.wait(1000)
    cy.get("body")
      .find("modal-picture-input")
      .shadow()
      .find("button.remove")
      .click()

    cy.get("modal-picture-input")
      .shadow()
      .find("img.image")
      .then(($image) => {
        const imageSource = $image.attr("src")

        expect(imageSource).to.be.empty
      })
  })
})
