import Select from "./Select.js"
import InputCollection from "./InputCollection.js"
import ModalPriceInput from "./ModalPriceInput.js"
import QuantityInput from "./QuantityInput.js"
import SelectVendor from "./SelectVendor.js"

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

<div id="New-Account-Modal" class="modal new-account-modal">
  <ul class="selector-phase">
    <li class="phase focus" data-value="1"></li>
    <li class="phase" data-value="2"></li>
    <li class="phase" data-value="3"></li>
    <li class="phase" data-value="4"></li>
    <li class="phase" data-value="5"></li>
    <li class="phase" data-value="6"></li>
  </ul>
  <div class="phases">
    <div class="first focused">
      <span class="label">ACCOUNT BELONGS TO:</span>
      <select-emphasized label="websites" />
    </div>
    <div class="second">
      <span class="label">ACCOUNT DATA:</span>
      <input type="text" placeholder="NICKNAME" class="LL" name="Nickname" autocomplete="off">
      <input type="text" placeholder="PASSWORD" class="LL" name="Password" autocomplete="off">
    </div>
    <div class="third">
      <span class="label">PRICE PAID:</span>
      <modal-price-input placeholder="$99.00 MXN" name="Price Input" />
    </div>
    <div class="fourth">
      <span class="label">OFFERS NUMBER:</span>
      <quantity-input initial="1" min="1" max="10" />
    </div>
    <div class="fifth">
      <span class="label">SELECT VENDOR:</span>
      <select-vendor placeholder="@VENDORR"/>
    </div>
    <div class="sixth">
      <span class="label">WARRANTY BEGINS:</span>
      <input type="text" class="LL" value="" placeholder="YYYY-MM-DD" autocomplete="off" name="Warranty Begins">
      <span class="label">WARRANTY ENDS:</span>
      <input type="text" class="LL" value="" placeholder="YYYY-MM-DD" autocomplete="off" name="Warranty Ends">
    </div>
  </div>
  <div class="buttons">
    <button class="button button-secondary button-medium previous-button" disabled>PREVIOUS</button>
    <button class="button button-secondary button-medium next-button" >NEXT</button>
  </div>
  <form name="new_acc" class="no-display" enctype="">
    <label for="" class="label">SELECT A WEBSITE:</label>
    <input type="text" name="A__SITE" readonly>
    <input type="text" name="A__NICK" readonly>
    <input type="text" name="A__PASS" readonly>
    <input type="text" name="A__PRICE" readonly>
    <input type="number" name="A__OFFERS" readonly value="1">
    <input type="text" name="A__VENDOR" readonly>
    <input type="text" name="A__WARRANTY_BEGINS" readonly>
    <input type="text" name="A__WARRANTY_ENDS" readonly>
  </form>
</div>
<div class="overlay"></div>
`
class NewAccountModal extends HTMLElement {
  constructor() {
    super()
    const clone = template.content.cloneNode(true)
    this.root = this.attachShadow({ mode: "closed" })
    this.root.append(clone)
    this.modalNode = this.root.querySelector("#New-Account-Modal")
    this.overlay = this.root.querySelector("#New-Account-Modal + .overlay")

    this.nextPhaseButton = this.modalNode.querySelector("button.next-button")
    this.previousPhaseButton = this.modalNode.querySelector(
      "button.previous-button"
    )
    this.phases = this.modalNode.querySelectorAll(".phases > div")
    this.phasesDots = this.modalNode.querySelectorAll(
      ".selector-phase > .phase"
    )

    this.selectWebsiteNode = this.modalNode.querySelector("select-emphasized")
    this.usernameInput = this.modalNode.querySelector("input[name='Nickname']")
    this.passwordInput = this.modalNode.querySelector("input[name='Password']")
    this.priceInputNode = this.modalNode.querySelector("modal-price-input")
    this.quantityInput = this.modalNode.querySelector("quantity-input")
    this.selectVendorNode = this.modalNode.querySelector("select-vendor")
    this.warrantyBeginsInput = this.modalNode.querySelector(
      "input[name='Warranty Begins']"
    )
    this.warrantyEndsInput = this.modalNode.querySelector(
      "input[name='Warranty Ends']"
    )

    this.actualPhase = 0
    this.inputIndex = 0

    this.inputCollection = new InputCollection()
    this.requestExists = false
  }

  connectedCallback() {
    this.overlay.addEventListener("click", () => this.close())
    this.nextPhaseButton.addEventListener("click", () => this.nextPhase())
    this.previousPhaseButton.addEventListener("click", () =>
      this.previousPhase()
    )
    this.setInputElements()
    this.fetchWebsites()
    Promise.resolve().then(this.setAsyncInputElements())
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

  async fetchWebsites() {
    let websites
    const url = "../v1/websites"
    const options = {
      method: "GET",
    }

    websites = await fetch(url, options)
      .then((req) => {
        if (req.ok) {
          return req.json()
        }
      })
      .then((data) => data)
      .finally(() => {})

    if (!websites) return false

    this.selectWebsiteNode.setOptions(websites)
    return true
  }

  flush() {
    this.selectWebsiteNode.optionChosen = null
    this.usernameInput.value = null
    this.passwordInput.value = null
    this.priceInputNode.value = ""
    this.quantityInput.value = 1
    this.selectVendorNode.value = null
    this.warrantyBeginsInput.value = null
    this.warrantyEndsInput.value = null
  }

  makeRequestBody() {
    const formData = new FormData()
    formData.append("__FUN", "New Account")
    formData.append("__WEBSITE", this.selectWebsiteNode.label)
    formData.append("__NICK", this.usernameInput.value)
    formData.append("__PASS", this.passwordInput.value)
    formData.append("__PRICE", this.priceInputNode.value)
    formData.append("__OFFERS", this.quantityInput.value)
    formData.append("__VENDOR", this.selectVendorNode.value.substring(1))
    formData.append("__WBEGINS", this.warrantyBeginsInput.value)
    formData.append("__WENDS", this.warrantyEndsInput.value)

    return formData
  }

  nextPhase() {
    if (this.actualPhase == 0) {
      this.previousPhaseButton.removeAttribute("disabled")
    } else if (this.actualPhase + 1 == this.phases.length) {
      if (this.validateModal()) {
        this.submit()
        this.flush()
        this.close()
      }

      return
    }

    if (this.validatePhase()) {
      this.phasesDots[this.actualPhase].classList.add("valid")
    } else {
      this.phasesDots[this.actualPhase].classList.remove("valid")
    }

    this.phasesDots[this.actualPhase].classList.remove("focus")
    this.phases[this.actualPhase].classList.add("had-focus")
    this.actualPhase++
    this.inputIndex++
    this.phases[this.actualPhase].classList.add("focused")
    this.phasesDots[this.actualPhase].classList.add("focus")
  }

  previousPhase() {
    if (this.actualPhase == 1) {
      this.previousPhaseButton.setAttribute("disabled", "")
    } else if (this.actualPhase - 1 < 0) {
      return
    }

    if (this.validatePhase()) {
      this.phasesDots[this.actualPhase].classList.add("valid")
    } else {
      this.phasesDots[this.actualPhase].classList.remove("valid")
    }

    this.phasesDots[this.actualPhase].classList.remove("focus")
    this.phases[this.actualPhase].classList.remove("focused")
    this.phases[this.actualPhase].classList.remove("had-focus")
    this.actualPhase--
    this.phases[this.actualPhase].classList.remove("had-focus")
    this.phases[this.actualPhase].classList.add("focused")
    this.phasesDots[this.actualPhase].classList.add("focus")
  }

  setAsyncInputElements() {
    const website = InputCollection.createSpecialInput(this.selectWebsiteNode)
    const price = InputCollection.createSpecialInput(this.priceInputNode)
    const quantity = InputCollection.createSpecialInput(this.quantityInput)
    const vendor = InputCollection.createSpecialInput(this.selectVendorNode)

    website.setLabel("__WEBSITE")
    website.setValidationExp(/\w{3,}/i)
    website.setUpdateValueCallback((inputNode) => {
      const value = inputNode.optionChosen
      return value
    })

    price.setLabel("__PRICE")
    price.setValidationExp(/\w{2,}/i)
    price.setUpdateValueCallback((inputNode) => {
      const value = inputNode.value
      return value
    })

    quantity.setLabel("__QUANTITY")
    quantity.setValidationExp(/[1-9]{1,2}/)
    quantity.setUpdateValueCallback((inputNode) => {
      const value = inputNode.value
      return value
    })

    vendor.setLabel("__VENDOR")
    vendor.setValidationExp(/\w{3,}/i)
    vendor.setUpdateValueCallback((inputNode) => {
      const value = inputNode.value
      return value
    })

    this.inputCollection.add(website)
    this.inputCollection.add(price)
    this.inputCollection.add(quantity)
    this.inputCollection.add(vendor)
  }

  setInputElements() {
    const usernameInput = InputCollection.createInput(this.usernameInput)
    const passwordInput = InputCollection.createInput(this.passwordInput)
    const warrantyEndsInput = InputCollection.createInput(
      this.warrantyEndsInput
    )
    const warrantyBeginsInput = InputCollection.createInput(
      this.warrantyBeginsInput
    )

    usernameInput.setValidationExp(/.{3,50}/i)
    passwordInput.setValidationExp(/.{3,50}/i)
    warrantyEndsInput.setValidationExp(/^\d{4}-\d{2}-\d{2}$/)
    warrantyBeginsInput.setValidationExp(/^\d{4}-\d{2}-\d{2}$/)

    this.inputCollection.add(usernameInput)
    this.inputCollection.add(passwordInput)
    this.inputCollection.add(warrantyEndsInput)
    this.inputCollection.add(warrantyBeginsInput)
  }

  submit() {
    if (this.requestExists) {
      return
    }

    this.requestExists = true

    const url = "../v1/accounts"
    const body = this.makeRequestBody()
    const options = {
      method: "POST",
      body: body
    }

    fetch(url, options).finally(() => {
      this.requestExists = false
    })
  }

  validatePhase() {
    const currentPhaseContainer = this.phases[this.actualPhase]
    const currentPhaseChildInputs = new Array()

    for (let i = 0; i < this.inputCollection.collection.length; i++) {
      if (
        currentPhaseContainer.contains(this.inputCollection.collection[i].node)
      ) {
        currentPhaseChildInputs.push(this.inputCollection.collection[i])
      }
    }

    if (!currentPhaseChildInputs.length)
      throw new Error(
        "No child elements detected for phase #" + this.actualPhase
      )

    for (let i = 0; i < currentPhaseChildInputs.length; i++) {
      const currentChildInput = currentPhaseChildInputs[i]
      if (!currentChildInput.isValid()) return false
    }

    return true
  }

  validateModal() {
    if (this.inputCollection.isValid()) return true

    return false
  }
}

customElements.define("new-account-modal", NewAccountModal)
