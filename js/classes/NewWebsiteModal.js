import TextInput from "./ModalTextInput.js"
import ModalURLInput from "./ModalURLInput.js"
import ModalPriceInput from "./ModalPriceInput.js"
import ModalPictureInput from "./ModalPictureInput.js"

const template = document.createElement("template")
template.innerHTML = `
  <style>
    @import url("../../css/style.css");
    modal-picture-input {
      height: 510px;
      flex-grow: 0;
      flex-shrink: 0;
      flex-basis: 510px;
    }
    .modal.hide {
      visibility: inherit;
      animation: hide_modal 125ms linear;
    }

    .modal.hide + .overlay {
      visibility: inherit;
      animation: hide_modal 125ms linear;
    }
  </style>

  <div id="New-Website-Modal" class="new-website-modal modal">
    <div class="carousel">
      <div class="strip">
        <modal-picture-input></modal-picture-input/>
        <modal-picture-input></modal-picture-input/>
        <modal-picture-input></modal-picture-input/>
      </div>
      <div class="controls">
        <figure class="control active" data-display="1"></figure>
        <figure class="control" data-display="2"></figure>
        <figure class="control" data-display="3"></figure>
      </div>
    </div>

    <div class="information">
      <header>
        <modal-text-input name="Sitecode" placeholder="SITE'S CODE"></modal-text-input>
        <modal-url-input placeholder="example.com/@jonhdoe" name="Url"></modal-url-input>
      </header>

      <div class="content">
        <div class="strip">
          <div class="row">
            <span class="label">NORMAL PRICE:</span>
            <modal-price-input placeholder="$XXX.XX MXN/MONTH" name="Normal Montly Price"></modal-price-input>
          </div>

          <div class="row">
            <span class="label">SALE PRICE:</span>
            <modal-price-input placeholder="$XXX.XX MXN/MONTH" name="Sale Montly Price"></modal-price-input>
          </div>

          <div class="row">
            <span class="label">SITE&apos;S TITLE:</span>
            <modal-text-input name="Title" placeholder="SPICY TITLE"></modal-text-input>
          </div>

          <div class="row">
            <span class="label">SITE&apos;S LOGO:</span>
            <button class="button button-primary ico-button" name="Logo">
              <svg width="14" height="17" viewBox="0 0 14 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 13H10V7H14L7 0L0 7H4V13ZM0 15H14V17H0V15Z" />
              </svg>
              <p>UPLOAD</p>
            </button>
          </div>
        </div>
      </div>

      <button class="button button-secondary next" name="Submit">NEXT</button>

      <div class="phases">
        <figure class="phase phase--active"></figure>
        <figure class="phase"></figure>
      </div>
    </div>

    <form style="display: none;">
      <input type="file" name="Logo" accept="image/png" />
    </form>
  </div>
  <div class="overlay"></div>
`

export class NewWebsiteModal extends HTMLElement {
  constructor() {
    super()
    const clone = template.content.cloneNode(true)
    this.root = this.attachShadow({ mode: "open" })
    this.root.append(clone)
    this.modalNode = this.root.querySelector("#New-Website-Modal")
    this.carouselStripNode = this.root.querySelector(".carousel .strip")
    this.carouselControlsNode = this.root.querySelector(".carousel .controls")
    this.carouselPictures = this.root.querySelectorAll("modal-picture-input")
    this.overlay = this.root.querySelector("#New-Website-Modal + .overlay")
    this.stage = 1
    this.stageControls = {}
    this.stageControls.firstStageNode = this.modalNode.querySelector(
      ".information .phases figure:nth-child(1)"
    )
    this.stageControls.secondStageNode = this.modalNode.querySelector(
      ".information .phases figure:nth-child(2)"
    )
    this.siteCodeInput = this.root.querySelector(
      "modal-text-input[name='Sitecode']"
    )
    this.siteTitleInput = this.root.querySelector(
      "modal-text-input[name='Title']"
    )
    this.siteUrlInput = this.root.querySelector("modal-url-input[name='Url']")
    this.siteNormalPriceInput = this.root.querySelector(
      "modal-price-input[name='Normal Montly Price']"
    )
    this.siteSalePriceInput = this.root.querySelector(
      "modal-price-input[name='Sale Montly Price']"
    )
    this.logoButtonNode = this.root.querySelector(
      ".information button[name='Logo']"
    )
    this.logoInput = this.root.querySelector("form input[name='Logo']")
    this.logoFile = null
    this.logoMaxFileSize = 500_000
    this.filesInput = this.root.querySelector("form input[type='file']")
    this.pictureNodes = this.root.querySelectorAll(
      ".strip > modal-picture-input"
    )
    this.submitButtonNode = this.root.querySelector(
      ".information button[name='Submit']"
    )
    this.formData = new FormData()
    this.inputCollection = new Array()
    this.requestExists = false
    this.queue = new Array()
  }

  connectedCallback() {
    this.setInputCollection()
    this.setSubmitButton(this.submitButtonNode)
    this.siteCodeInput.setValidationRegex(/^.{2,10}$/i)
    this.siteTitleInput.setValidationRegex(/^.{4,24}$/i)
    this.overlay.addEventListener("click", () => this.close())
    this.stageControls.firstStageNode.addEventListener("click", () =>
      this.showFirstStage()
    )
    this.stageControls.secondStageNode.addEventListener("click", () =>
      this.showSecondStage()
    )
    this.logoInput.addEventListener("change", (e) =>
      this.setLogo(e.target.files[0])
    )
    this.logoButtonNode.addEventListener("click", () => {
      this.logoInput.click()
    })
    this.carouselControlsNode.addEventListener("click", (e) =>
      this.moveCarousel(e.target)
    )
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

  flush() {
    const label = "UPLOAD"
    this.siteCodeInput.value = ""
    this.siteUrlInput.value = ""
    this.siteNormalPriceInput.value = ""
    this.siteSalePriceInput.value = ""
    this.siteTitleInput.value = ""
    this.logoButtonNode.querySelector("p").textContent = label
    this.logoFile = null
    this.carouselPictures.forEach((picture) => picture.flush())
  }

  setSubmitButton(buttonNode) {
    buttonNode.addEventListener("click", () => {
      this.submit()
    })
  }

  setLogo(file) {
    if (file.size <= this.logoMaxFileSize && file.type === "image/png") {
      const label = file.name.substring(0, 4).concat(".png")
      this.logoButtonNode.querySelector("p").textContent = label
      this.logoFile = file
    } else {
      // console.error("File for logo is either too large or of an invalid format")
    }
  }

  setInputCollection() {
    this.addInput(this.siteCodeInput, /^.{2,10}$/i, {})
    this.addInput(this.siteTitleInput, /^.{4,24}$/i, {})
    this.addInput(
      this.siteUrlInput,
      /^(?:www\.)?.{2,}\.\w{2,4}(?:\/.{0,24})?$/i,
      {}
    )
    this.addInput(
      this.siteNormalPriceInput,
      /^[1-9]+\d{0,2}\.\d\d MXN\/MONTH$/i,
      {}
    )
    this.addInput(
      this.siteSalePriceInput,
      /^[1-9]+\d{0,2}\.\d\d MXN\/MONTH$/i,
      {}
    )
  }

  showFirstStage() {
    if (this.stage === 2) {
      this.stage = 1
      const stripNode = this.modalNode.querySelector(
        ".information .content .strip"
      )
      stripNode.classList.remove("strip--final-stage")
      this.stageControls.firstStageNode.classList.add("phase--active")
      this.stageControls.secondStageNode.classList.remove("phase--active")
    }
  }

  showSecondStage() {
    if (this.stage === 1) {
      this.stage = 2
      const stripNode = this.modalNode.querySelector(
        ".information .content .strip"
      )
      stripNode.classList.add("strip--final-stage")
      this.stageControls.secondStageNode.classList.add("phase--active")
      this.stageControls.firstStageNode.classList.remove("phase--active")
    }
  }

  submit() {
    if (this.stage === 1) {
      this.showSecondStage()
    } else if (!this.validateModal()) {
      return
    }

    const url = "../v1/websites"
    const body = this.makeRequestBody()

    const options = {
      method: "POST",
      body: body,
    }

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

  moveCarousel(targetNode) {
    const activeNode = this.carouselControlsNode.querySelector(".active")
    if (
      targetNode.tagName === "FIGURE" &&
      targetNode.hasAttribute("data-display")
    ) {
      const currentPosition = Number.parseInt(
        activeNode.getAttribute("data-display")
      )
      const nextPosition = Number.parseInt(
        targetNode.getAttribute("data-display")
      )

      if (currentPosition !== nextPosition) {
        let index = nextPosition - 1
        this.carouselStripNode.style.transform = `translateX( ${-(
          510 * index
        )}px)`
        targetNode.classList.add("active")
        activeNode.classList.remove("active")
      }
    }
  }

  makeInputCollection() {
    if (!this.inputCollection.length)
      throw new Error("Input collection is empty")

    const data = {}
    this.inputCollection.forEach((item) => {
      // data[item.node.name || item.name] = item.value
      data[item.name] = item.value
    })

    return data
  }

  makePicturesCollection() {
    const collectionBody = {}
    this.carouselPictures.forEach((picture, i) => {
      const pictureData = picture.getPictureData()
      const index = i + 1
      collectionBody[`__PICTURE_${index}`] = pictureData.file
      collectionBody[
        `__PICTURE_${index}_COORDS`
      ] = `${pictureData.coords.X}/${pictureData.coords.Y}`
      collectionBody[`__PICTURE_${index}_SCALE`] = pictureData.scale
    })

    return collectionBody
  }

  makeLogoObject() {
    return { __LOGO: this.logoFile }
  }

  makeRequestBody() {
    const pictureCollection = this.makePicturesCollection()
    const body = new FormData()
    body.append("__PUT", 1)
    body.append("__WEBSITE", 1)
    body.append("__SITE_CODE", this.siteCodeInput.value)
    body.append("__SITE_TITLE", this.siteTitleInput.value)
    body.append("__SITE_URL", this.siteUrlInput.value)
    body.append("__ORIGINAL_PRICE", this.siteNormalPriceInput.getNumberValue())
    body.append("__SALE_PRICE", this.siteSalePriceInput.getNumberValue())
    body.append("__LOGO", this.logoFile)

    for (const key in pictureCollection) {
      body.append(key, pictureCollection[key])
    }

    return body
  }

  validateInputCollection() {
    if (!this.inputCollection.length)
      throw new Error("Modal's input collection is empty")
    const invalidInputs = this.inputCollection.filter((currentInput) => {
      currentInput.updateValue()
      if (!currentInput.validationExp.test(currentInput.value))
        return currentInput
    })
    // const invalidInputs = this.inputCollection.filter( currentInput => !currentInput.validationExp.test(currentInput.updateValue()));
    // console.log('invalid inputs list', invalidInputs)
    // console.log('current predicate:', invalidInputs.length >= 0)
    if (this.inputCollection.length === 0 || invalidInputs.length > 0)
      return false
    return true
  }

  validatePicturesCollection() {
    for (let i = 0; i < this.carouselPictures.length; i++) {
      const currentPicture = this.carouselPictures[i]
      if (!currentPicture.isValid()) return false
    }

    return true
  }

  validateModal() {
    if (
      this.validateInputCollection() &&
      this.validatePicturesCollection() &&
      this.validateLogo()
    ) {
      return true
    } else {
      return false
    }
  }

  validateLogo() {
    if (this.logoFile && this.logoFile instanceof File) return true
    else return false
  }

  addInput(inputNode, validationExp, bannedKeys) {
    if (!inputNode.getAttribute("name"))
      throw new Error(
        `Node ${inputNode.nodeName}(type:${inputNode.type}) does not have a 'name' attribute defined`
      )

    const label = inputNode.getAttribute("name")
    const inputObj = {
      name: label,
      node: inputNode,
      value: inputNode.value,
      validationExp,
      bannedKeys,
      updateValue: function () {
        this.value = inputNode.value
      },
    }
    this.inputCollection.push(inputObj)
  }

  addSpecialInput(label, inputNode, validationExp, trackedValueCallback) {
    if (label === "" || typeof label !== "string")
      throw new Error(
        "Without a valid provided label attribute, the value given by the custom input element cannot be identified"
      )

    const inputObj = {
      name: label,
      node: inputNode,
      value: trackedValueCallback(inputNode),
      validationExp: validationExp,
      updateValue: function () {
        this.value = trackedValueCallback(inputNode)
      },
    }

    this.inputCollection.push(inputObj)
    this.queue.push(label)
  }
}

customElements.define("new-website-modal", NewWebsiteModal)
