describe("basic functionality", () => {
  const accountID = "XXX-25A1B2"

  beforeEach(() => {
    cy.intercept("POST", Cypress.env("API_HUB_URI"), (req) => {
      req.reply({
        SITE_CODE: "TEST",
        ACCOUNT_ID: "XXX-25A1B2",
        ACCOUNT_NICK: "JohnDoe",
        ACCOUNT_PASS: "superman",
        PRICE_PAID: "99.99",
        WARRANTY_BEGINS: "2025-01-01",
        WARRANTY_ENDS: "2025-01-31",
        N_SOLD: 0,
        N_AVAILABLE: 4,
        SITE_URL: "test.com",
      })
    }).as("accountRequest")

    cy.visit(Cypress.env("EDITACCOUNTMODAL_MOCKUP_URI"))
    cy.get("edit-account-modal", { timeout: 5000 })
    cy.get("button.open").click().wait(1000)

    cy.get("edit-account-modal").then(($modal) => {
      const modal = $modal[0]
      cy.wait(500)
      modal.fetchAccount()
      modal.setAttribute("account", accountID)
    })
  })

  it("exists (main node)", () => {
    cy.get("body").find("edit-account-modal").should("exist")
  })

  it("opens and closes", () => {
    cy.get("edit-account-modal")
      .shadow()
      .find("div#Edit-Account-Modal")
      .should("be.visible")
      .wait(500)

    cy.get("edit-account-modal")
      .shadow()
      .find("div#Edit-Account-Modal + div")
      .trigger("click", { force: true })

    cy.wait(1000)

    cy.get("edit-account-modal")
      .shadow()
      .find("div#Edit-Account-Modal")
      .should("not.be.visible")

    cy.get("edit-account-modal")
      .shadow()
      .find("div#Edit-Account-Modal + div")
      .should("not.be.visible")
  })

  it("changes the active tab", () => {
    cy.get("edit-account-modal")
      .shadow()
      .find(".phases .status")
      .should("be.visible")
      .wait(500)

    cy.get("edit-account-modal")
      .shadow()
      .find(".navigation .tab:nth-child(2)")
      .click()
      .wait(500)

    cy.get("edit-account-modal")
      .shadow()
      .find(".phases .account")
      .should("be.visible")
      .wait(500)

    cy.get("edit-account-modal")
      .shadow()
      .find(".navigation .tab:nth-child(3)")
      .click()
      .wait(500)

    cy.get("edit-account-modal")
      .shadow()
      .find(".phases .details")
      .should("be.visible")
      .wait(500)

    cy.get("edit-account-modal")
      .shadow()
      .find(".navigation .tab:nth-child(1)")
      .click()
      .wait(500)

    cy.get("edit-account-modal")
      .shadow()
      .find(".phases .status")
      .should("be.visible")
  })

  it("fetches the account", () => {
    cy.get("edit-account-modal").then(($modal) => {
      const modal = $modal[0]
      cy.wait(500)
      modal.fetchAccount()
      modal.setAttribute("account", accountID)

      cy.wait("@accountRequest")
    })
  })

  it("sends the request to kill the account", () => {
    cy.get("edit-account-modal").then(($modal) => {
      const modal = $modal[0]
      modal.setAttribute("account", accountID)
      cy.wait("@accountRequest")
    })

    cy.get("edit-account-modal").then(($modal) => {
      const modal = $modal[0]
      const killAccountRequest = cy
        .stub(modal, "killAccount")
        .as("killAccountRequest")

      cy.wrap($modal).shadow().find("button.kill-button").click()
    })

    cy.get("@killAccountRequest").should("have.been.called")
  })

  it("prevents form submission if there exists no changes on fields", () => {
    cy.intercept("POST", Cypress.env("API_HUB_URI")).as("submitRequest")
    cy.get("edit-account-modal").then(($modal) => {
      const modal = $modal[0]
      modal.setAttribute("account", accountID)
      cy.wait("@accountRequest")
    })

    cy.get("edit-account-modal").then(($modal) => {
      const modal = $modal[0]

      cy.wrap($modal)
        .shadow()
        .find("button.save-button")
        .should("be.disabled")
        .click({ force: true })

      cy.wait("@submitRequest").then((interception) => {
        expect(interception.request.body).to.not.contain("__PUT")
      })
    })
  })
})

describe("how does the modal react to modifications of its initial state", () => {
  const accountID = "XXX-25A1B2"
  const w_begins_mock = "2025-01-11"
  const w_ends_mock = "2025-02-01"
  const nick_mock = "JoeMoma"
  const pass_mock = "supergirl"
  const price_mock = "77.77"

  beforeEach(() => {
    cy.intercept("POST", Cypress.env("API_HUB_URI"), (req) => {
      req.reply({
        SITE_CODE: "TEST",
        ACCOUNT_ID: "XXX-25A1B2",
        ACCOUNT_NICK: "JohnDoe",
        ACCOUNT_PASS: "superman",
        PRICE_PAID: "99.99",
        WARRANTY_BEGINS: "2025-01-01",
        WARRANTY_ENDS: "2025-01-31",
        N_SOLD: 0,
        N_AVAILABLE: 4,
        SITE_URL: "test.com",
      })
    }).as("accountRequest")

    cy.visit(Cypress.env("EDITACCOUNTMODAL_MOCKUP_URI"))
    cy.get("edit-account-modal", { timeout: 5000 })
    cy.get("button.open").click().wait(1000)

    cy.get("edit-account-modal").then(($modal) => {
      const modal = $modal[0]
      cy.wait(500)
      modal.fetchAccount()
      modal.setAttribute("account", accountID)

      cy.wait("@accountRequest")
    })
  })

  it("detects changes made to the initial state of modal (warranty begin case)", () => {
    cy.get("edit-account-modal").then(($modal) => {
      let initial_w_begins

      cy.wrap($modal)
        .shadow()
        .find("input[name='Warranty Begins']")
        .then(($WBeginsInput) => {
          const initial_warranty = $WBeginsInput[0].value

          cy.wrap(initial_warranty).as("initialWarranty")
          cy.wrap($WBeginsInput)
            .dblclick()
            .clear()
            .type(w_begins_mock, { delay: 25 })
            .blur()
        })

      cy.wrap($modal).shadow().find("button.save-button").should("be.enabled") // button should become enabled with recent changes made to warranty date field

      cy.wait(500)

      cy.get("@initialWarranty").then((initialWarranty) => {
        initial_w_begins = initialWarranty
      })

      cy.wrap($modal)
        .shadow()
        .find("input[name='Warranty Begins']")
        .then(($WBeginsInput) => {
          cy.wrap($WBeginsInput)
            .dblclick()
            .clear()
            .type(initial_w_begins, { delay: 25 })
            .blur()
        })

      cy.wrap($modal).shadow().find("button.save-button").should("be.disabled") // reverted changes made to warranty date should make the save button to become disabled
    })
  })

  it("detects changes made to the initial state of modal (warranty end case)", () => {
    cy.get("edit-account-modal").then(($modal) => {
      let initial_w_ends

      cy.wrap($modal)
        .shadow()
        .find("input[name='Warranty Ends']")
        .then(($WEndsInput) => {
          const initial_warranty = $WEndsInput[0].value

          cy.wrap(initial_warranty).as("initialWarranty")
          cy.wrap($WEndsInput)
            .dblclick()
            .clear()
            .type(w_ends_mock, { delay: 25 })
            .blur()
        })

      cy.wrap($modal).shadow().find("button.save-button").should("be.enabled") // button should become enabled with recent changes made to warranty date field

      cy.wait(500)

      cy.get("@initialWarranty").then((initialWarranty) => {
        initial_w_ends = initialWarranty
      })

      cy.wrap($modal)
        .shadow()
        .find("input[name='Warranty Ends']")
        .then(($WEndsInput) => {
          cy.wrap($WEndsInput)
            .dblclick()
            .clear()
            .type(initial_w_ends, { delay: 25 })
            .blur()
        })

      cy.wrap($modal).shadow().find("button.save-button").should("be.disabled") // reverted changes made to warranty date should make the save button to become disabled
    })
  })

  it("detects changes made to the initial state of modal (nickname case)", () => {
    cy.get("edit-account-modal").then(($modal) => {
      let initial_pass

      cy.wrap($modal)
        .shadow()
        .find(".navigation .tab:nth-child(2)")
        .click()
        .wait(500)

      cy.wrap($modal)
        .shadow()
        .find("input[name='Nickname']")
        .then(($nickInput) => {
          cy.wrap($nickInput)
            .dblclick()
            .clear()
            .type(nick_mock, { delay: 25 })
            .blur()
        })

      cy.wrap($modal).shadow().find("button.save-button").should("be.disabled") // nickname changes do not make the save button to be enabled

      cy.wrap($modal)
        .shadow()
        .find("input[name='Password']")
        .then(($passInput) => {
          const initial_pass = $passInput[0].value

          cy.wrap(initial_pass).as("initialPass")
          cy.wrap($passInput)
            .dblclick()
            .clear()
            .type(pass_mock, { delay: 25 })
            .blur()
        })

      cy.wrap($modal).shadow().find("button.save-button").should("be.enabled") // password changes should make the save button to become enabled

      cy.wait(500)

      cy.get("@initialPass").then((initialPass) => {
        initial_pass = initialPass
      })

      cy.wrap($modal)
        .shadow()
        .find("input[name='Password']")
        .then(($passInput) => {
          cy.wrap($passInput)
            .dblclick()
            .clear()
            .type(initial_pass, { delay: 25 })
            .blur()
        })

      cy.wrap($modal).shadow().find("button.save-button").should("be.disabled") // revert modal state thus making the save button become disabled
    })
  })

  it("detects changes made to the initial state of modal (price input case)", () => {
    cy.get("edit-account-modal").then(($modal) => {
      let initial_price

      cy.wrap($modal).shadow().find(".navigation .tab:nth-child(3)").click()

      cy.wait(500)

      cy.wrap($modal)
        .shadow()
        .find("modal-price-input")
        .shadow()
        .find("input")
        .then(($priceInput) => {
          const initial_price = $priceInput[0].value

          cy.wrap(initial_price).as("initialPrice")
          cy.wrap($priceInput)
            .focus()
            .type("{backspace}{backspace}{backspace}{backspace}", { delay: 25 })
            .type(price_mock, { delay: 25 })
        })

      cy.wrap($modal).shadow().find("button.save-button").should("be.enabled") // price changes should make the save button to become enabled

      cy.get("@initialPrice").then((initialPrice) => {
        initial_price = initialPrice
      })

      cy.wait(2000)

      cy.wrap($modal)
        .shadow()
        .find("modal-price-input")
        .shadow()
        .find("input")
        .then(($priceInput) => {
          cy.wrap($priceInput)
            .focus()
            .type(
              "{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}",
              { delay: 25 }
            )
            .type(initial_price, { delay: 25 })
        })

      cy.wrap($modal).shadow().find("button.save-button").should("be.disabled") // revert modal state thus making the save button become disabled
    })
  })

  it("detects changes made to the initial state of modal (quantity input case)", () => {
    cy.get("edit-account-modal").then(($modal) => {
      let initial_quantity

      cy.wrap($modal).shadow().find(".navigation .tab:nth-child(3)").click()

      cy.wait(500)

      cy.wrap($modal)
        .shadow()
        .find("quantity-input")
        .then(($quantityInput) => {
          const initial_quantity = $quantityInput[0].value

          cy.wrap(initial_quantity).as("initialQuantity")
          cy.wrap($quantityInput).shadow().find("button[name='add']").click()
        })

      cy.wrap($modal).shadow().find("button.save-button").should("be.enabled") // quantity input changes should make the save button to become enabled

      cy.get("@initialQuantity").then((initialQuantity) => {
        initial_quantity = initialQuantity
      })

      cy.wait(2000)

      cy.wrap($modal)
        .shadow()
        .find("quantity-input")
        .shadow()
        .find("button[name='minus']")
        .click()

      cy.wait(500)

      cy.wrap($modal)
        .shadow()
        .find("quantity-input")
        .then(($quantityInput) => {
          const quantityInput = $quantityInput[0]
          const currentValue = quantityInput.currentValue

          expect(currentValue).to.equal(initial_quantity)
        })

      cy.wrap($modal).shadow().find("button.save-button").should("be.disabled") // revert modal state thus making the save button become disabled
    })
  })
})
