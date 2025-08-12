import InputCollection from "./InputCollection.js"
import ModalPriceInput from "./ModalPriceInput.js"
import QuantityInput from "./QuantityInput.js"

const template = document.createElement("template")
template.innerHTML = `
<style>
  @import url("../../css/style.css");

  .modal.hide {
    visibility: inherit;
    animation: hide_modal 125ms linear;
  }

  .modal.hide + .overlay {
    visibility: inherit;
    animation: hide_modal 125ms linear;
  }
</style>

<div id="Edit-Account-Modal" class="modal edit-account-modal">
  <nav class="navigation">
    <span class="tab tab--active">STATUS</span>
    <span class="tab">ACCOUNT</span>
    <span class="tab">DETAILS</span>
  </nav>
  <div class="phases">
    <div class="status focused">
      <div class="row">
        <span class="label status">STATUS: <span class="badge badge-active">ACTIVE</span> </span>
        <small class="days-left">EXPIRES IN X DAYS</small>
      </div>
      <div class="row">
        <span class="label">WARRANTY BEGINS:</span>
        <input type="text" class="LL" autocomplete="off" name="Warranty Begins" readonly>
      </div>
      <div class="row">
        <span class="label">WARRANTY ENDS:</span>
        <input type="text" class="LL" autocomplete="off" name="Warranty Ends" readonly>
      </div>
    </div>
    <div class="account">
      <div class="row">
        <span class="label">ACCOUNT CREDENTIALS:</span>
        <input type="text" class="credential-input" name="Nickname" autocomplete="off" readonly>
        <input type="text" class="credential-input" name="Password" autocomplete="off" readonly>
      </div>
      <div class="row">
        <span class="label">BELONGS TO:</span>
        <h4 class="site-code">NULL</h4>
      </div>
    </div>
    <div class="details">
      <div class="row">
        <span class="label">PRICE PAID:</span>
        <modal-price-input />
      </div>
      <div class="row">
        <span class="label">OFFERS NUMBER:</span>
        <quantity-input max="20" />
      </div>
      <div class="row">
        <span class="label">VENDOR:</span>
        <a href="" class="vendor-link">
          <figure class="vendor__avatar"></figure>
          <span class="vendor__label">@undefined</span>
        </a>
      </div>
    </div>
  </div>
  <div class="buttons">
    <button class="button button-secondary button-small kill-button">KILL</button>
    <button class="button button-primary button-small save-button" value="" autocomplete="off" disabled>SAVE</button>
  </div>
  <small class="account-id" >
  <b>ACCOUNT ID:</b>
  <span></span>
  </small>
  <figure class="status-bar"></figure>
</div>
<div class="overlay"></div>
`
class EditAccountModal extends HTMLElement {
  static observedAttributes = ["account"]

  constructor() {
    super()
    const clone = template.content.cloneNode(true)
    this.root = this.attachShadow({ mode: "closed" })
    this.root.append(clone)
    this.modalNode = this.root.querySelector("#Edit-Account-Modal")
    this.tabsParent = this.modalNode.querySelector(".navigation")
    this.tabs = this.modalNode.querySelector(".navigation > .tab")
    this.usernameInput = this.modalNode.querySelector("input[name='Nickname']")
    this.passwordInput = this.modalNode.querySelector("input[name='Password']")
    this.warrantyBeginsInput = this.modalNode.querySelector(
      "input[name='Warranty Begins']"
    )
    this.warrantyEndsInput = this.modalNode.querySelector(
      "input[name='Warranty Ends']"
    )
    this.priceInputNode = this.modalNode.querySelector("modal-price-input")
    this.quantityInputNode = this.modalNode.querySelector("quantity-input")
    this.accountVendorNode = this.modalNode.querySelector(".vendor__label")
    this.accountIdLabel = this.modalNode.querySelector("small.account-id span")
    this.accountSiteNode = this.modalNode.querySelector("h4.site-code")
    this.updateAccountButton =
      this.modalNode.querySelector("button.save-button")
    this.killAccountButton = this.modalNode.querySelector("button.kill-button")
    this.overlay = this.root.querySelector("div.overlay")

    this.requestExists = false
    this.isModalDirty = false
    this.accountId = null

    this.initialInputCollection = new InputCollection()
    this.diffInputCollection = new InputCollection()
  }

  connectedCallback() {
    this.setFormFieldsHandler()

    this.tabsParent.addEventListener("click", (e) => {
      this.changeTab(e.target)
    })
    this.overlay.addEventListener("click", () => this.close())
    this.updateAccountButton.addEventListener("click", () => this.submit())
    this.killAccountButton.addEventListener("click", () => this.killAccount())

    Promise.resolve().then(this.setSpecialInputsHandlers())
  }

  attributeChangedCallback(attribute, oldVal, newVal) {
    if (attribute !== "account") {
      return
    }

    this.accountId = newVal
    this.setModal()
  }

  open() {
    this.modalNode.classList.add("visible")
  }

  close() {
    const handler = () => {
      this.modalNode.classList.remove("visible")
      this.modalNode.classList.remove("hide")
      this.modalNode.removeEventListener("animationend", handler)
    }

    this.modalNode.addEventListener("animationend", handler)
    this.modalNode.classList.add("hide")
  }

  changeTab(target) {
    const activeTab = this.modalNode.querySelector(".navigation .tab--active")
    const activePhase = this.modalNode.querySelector(".phases .focused")

    activeTab.classList.remove("tab--active")
    activePhase.classList.remove("focused")

    if (target.innerHTML == "STATUS") {
      target.classList.add("tab--active")
      this.modalNode.querySelector(".phases .status").classList.add("focused")
      return
    }

    if (target.innerHTML == "ACCOUNT") {
      target.classList.add("tab--active")
      this.modalNode.querySelector(".phases .account").classList.add("focused")
      return
    }

    if (target.innerHTML == "DETAILS") {
      target.classList.add("tab--active")
      this.modalNode.querySelector(".phases .details").classList.add("focused")
      return
    }
  }

  async fetchAccount(accountID) {
    let account
    const url = "./hub.php"
    const body = new FormData()
    const options = {
      method: "POST",
      body: body,
    }

    if (this.requestExists) {
      return
    }

    body.append("__PULL", "1")
    body.append("__ACCOUNT", "1")
    body.append("__ACCOUNT_ID", accountID)

    account = await fetch(url, options)
      .then((req) => {
        if (req.ok) {
          return req.json()
        }
      })
      .then((data) => data)
      .finally(() => {
        this.requestExists = false
      })

    if (!account) {
      return false
    }

    return account
  }

  fillInputCollectionAsync() {
    const price = InputCollection.createSpecialInput(this.priceInputNode)
    const quantity = InputCollection.createSpecialInput(this.quantityInputNode)

    price.setLabel("Price")
    price.setValidationExp(/^\$((?!(0))\d{1,3})\.(?=(0))00\sMXN\/MONTH$/i)
    price.setUpdateValueCallback((inputNode) => {
      const value = inputNode.value
      return value
    })

    quantity.setLabel("Offers")
    quantity.setValidationExp(/\d{1,2}/)
    quantity.setUpdateValueCallback((inputNode) => {
      const value = inputNode.value
      return value
    })

    this.initialInputCollection.add(price)
    this.initialInputCollection.add(quantity)
  }

  fillInputCollection() {
    const warrantyBegins = InputCollection.createInput(this.warrantyBeginsInput)
    const warrantyEnds = InputCollection.createInput(this.warrantyEndsInput)
    const password = InputCollection.createInput(this.passwordInput)

    warrantyBegins.setValidationExp(/^\d{4}-\d{2}-\d{2}$/)
    warrantyEnds.setValidationExp(/^\d{4}-\d{2}-\d{2}$/)
    password.setValidationExp(/\w{3,}/i)

    this.initialInputCollection.add(warrantyBegins)
    this.initialInputCollection.add(warrantyEnds)
    this.initialInputCollection.add(password)
  }

  fillModal(account) {
    const price = Number.parseInt(account.PRICE_PAID)

    this.accountIdLabel.textContent = account.ACCOUNT_ID
    this.usernameInput.value = account.ACCOUNT_NICK
    this.passwordInput.value = account.ACCOUNT_PASS
    this.warrantyBeginsInput.value = account.WARRANTY_BEGINS
    this.warrantyEndsInput.value = account.WARRANTY_ENDS

    this.accountSiteNode.textContent = account.SITE_CODE
    this.accountVendorNode.textContent = "@" + account.VENDOR_ID

    this.quantityInputNode.setMinimum(account.N_AVAILABLE)
    this.quantityInputNode.setInitial(account.N_AVAILABLE)

    this.priceInputNode.value = price
  }

  flush() {
    this.initialInputCollection = new InputCollection()
    this.diffInputCollection = new InputCollection()

    this.warrantyBeginsInput.value = null
    this.warrantyEndsInput.value = null
    this.usernameInput.value = null
    this.passwordInput.value = null
    this.priceInputNode.value = "0"
    this.quantityInputNode.value = 0

    this.accountId = null
    this.accountIdLabel.textContent = null
  }

  killAccount() {
    const url = "./hub.php"
    const body = new FormData()
    const options = {
      method: "POST",
      body: body,
    }

    body.append("__PUT", "1")
    body.append("__KILL", "1")
    body.append("__ACCOUNT_ID", this.accountId)

    if (this.requestExists) {
      return
    }

    this.requestExists = true

    fetch(url, options).finally(() => {
      this.requestExists = false
      this.flush()
      this.close()
    })
  }

  makeRequestBody() {
    const body = new FormData()
    const dictionary = new Map()

    dictionary.set("Warranty Begins", "__WBEGINS")
    dictionary.set("Warranty Ends", "__WENDS")
    dictionary.set("Nickname", "__NICKNAME")
    dictionary.set("Password", "__PASSWORD")
    dictionary.set("Price", "__PRICE")
    dictionary.set("Offers", "__AVAILABLE_ACCOUNTS")

    body.append("__PUT", "1")
    body.append("__ACCOUNT", "1")
    body.append("__ACCOUNT_ID", this.accountId)

    for (const diffInput of this.diffInputCollection.collection) {
      const translatedLabel = dictionary.get(diffInput.label)
      if (translatedLabel === "__PRICE") {
        body.append(translatedLabel, diffInput.node.getNumberValue())
        continue
      }

      body.append(translatedLabel, diffInput.value)
    }

    return body
  }

  setFormFieldsHandler() {
    this.modalNode.addEventListener("dblclick", (e) => {
      if (e.target instanceof HTMLInputElement) {
        const formInput = e.target
        formInput.removeAttribute("readonly")
        formInput.addEventListener("focusout", focusoutHandler)
      }
    })

    const focusoutHandler = (e) => {
      const formField = e.target
      const value = formField.value
      const formFieldLabel = formField.getAttribute("name")
      const existingInitialInput =
        this.initialInputCollection.find(formFieldLabel)

      formField.setAttribute("readonly", true)
      formField.removeEventListener("focusout", focusoutHandler)

      if (
        existingInitialInput &&
        !this.diffInputCollection.find(formFieldLabel) &&
        value !== existingInitialInput.value
      ) {
        const input = InputCollection.createInput(formField)
        input.setValidationExp(existingInitialInput.validationExp)

        this.diffInputCollection.add(input)
        this.spoil()
      } else if (this.diffInputCollection.find(formFieldLabel)) {
        const existingDiffInput = this.diffInputCollection.find(formFieldLabel)
        existingDiffInput.updateValue()

        if (existingDiffInput.value === existingInitialInput.value) {
          this.diffInputCollection.remove(formFieldLabel)
        }
      }

      if (!this.diffInputCollection.collection.length) {
        this.pristine()
      }
    }
  }

  setSpecialInputsHandlers() {
    const priceInputLabel = "Price"
    const quantiyInputLabel = "Offers"

    const priceInputNodeHandler = (e) => {
      const priceInputNode = e.target
      const existingInitialInput =
        this.initialInputCollection.find(priceInputLabel)
      const existingDiffInput = this.diffInputCollection.find(priceInputLabel)

      if (
        existingInitialInput &&
        !existingDiffInput &&
        existingInitialInput.value !== priceInputNode.value
      ) {
        const price = InputCollection.createSpecialInput(this.priceInputNode)
        price.setLabel("Price")
        price.setValidationExp(/^\$((?!(0))\d{1,3})\.(?=(0))00\sMXN\/MONTH$/i)
        price.setUpdateValueCallback((inputNode) => {
          const value = inputNode.value
          return value
        })
        this.diffInputCollection.add(price)
        this.spoil()
      } else if (existingDiffInput) {
        existingDiffInput.updateValue()

        if (existingDiffInput.value === existingInitialInput.value) {
          this.diffInputCollection.remove(priceInputLabel)
        }
      }

      if (!this.diffInputCollection.collection.length) {
        this.pristine()
      }
    }

    const quantiyInputHandler = () => {
      const existingInitialInput =
        this.initialInputCollection.find(quantiyInputLabel)
      const existingDiffInput = this.diffInputCollection.find(quantiyInputLabel)

      if (
        !existingDiffInput &&
        this.quantityInputNode.value !== existingInitialInput.value
      ) {
        const quantityInput = InputCollection.createSpecialInput(
          this.quantityInputNode
        )
        quantityInput.setLabel(quantiyInputLabel)
        quantityInput.setValidationExp(/\d{1,2}/)
        quantityInput.setUpdateValueCallback((inputNode) => {
          const value = inputNode.value
          return value
        })

        this.diffInputCollection.add(quantityInput)
        this.spoil()
      } else if (existingDiffInput) {
        existingDiffInput.updateValue()

        if (existingDiffInput.value === existingInitialInput.value) {
          this.diffInputCollection.remove(quantiyInputLabel)
        }
      }

      if (!this.diffInputCollection.collection.length) {
        this.pristine()
      }
    }

    this.priceInputNode.addEventListener("focusout", priceInputNodeHandler)
    this.quantityInputNode.addEventListener("click", quantiyInputHandler)
  }

  async setModal() {
    if (!this.accountId) {
      throw new Error("Modal does not contain an account ID")
    }

    let accountInfo = await this.fetchAccount(this.accountId)
    this.isModalDirty = false

    if (!accountInfo) {
      throw new Error(
        "No valid account info was retrieved.. Try again with another ID"
      )
    }

    this.open()
    this.fillModal(accountInfo)
    this.fillInputCollection()
    this.pristine()
    Promise.resolve().then(this.fillInputCollectionAsync())
  }

  submit() {
    if (this.requestExists || !this.diffInputCollection.collection.length) {
      if (!this.updateAccountButton.hasAttribute("disabled")) {
        this.updateAccountButton.setAttribute("disabled", 1)
      }
      return
    }

    if (!this.diffInputCollection.isValid()) {
      return
    }

    const url = "./hub.php"
    const body = this.makeRequestBody()
    const options = {
      method: "POST",
      body: body,
    }

    this.requestExists = true

    fetch(url, options).finally(() => {
      this.requestExists = false
      this.flush()
      this.close()
    })
  }

  pristine() {
    this.isModalDirty = false
    this.updateAccountButton.setAttribute("disabled", true)
  }

  spoil() {
    this.isModalDirty = true
    this.updateAccountButton.removeAttribute("disabled")
  }
}

customElements.define("edit-account-modal", EditAccountModal)
