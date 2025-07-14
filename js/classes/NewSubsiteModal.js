import TextInput from "./ModalTextInput.js"
import ModalPictureInput from "./ModalPictureInput.js"

const template = document.createElement("template")
template.innerHTML = `
  <style>
    @import url("../../css/style.css");

    modal-picture-input {
      display:block;
      width: 100%;
      height: 100%;
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
  <div id="New-Children-Website-Modal" class="modal children-website-modal edit">
  
    <section class="picture">
      <modal-picture-input name='Subsite Picture'></modal-picture-input>
      <figure class="logotype">
        <img src="" title="Logo">
      </figure>
    </section>
    <section class="information-input">
      <div class="row">
        <span class="label">SUBSITE'S TITLE:</span>
        <modal-text-input placeholder="SUPERTETONAS" name="Subsite Title"></modal-text-input>
      </div>
      <div class="row">
        <span class="label">SUBSITE'S LOGO:</span>
        <button class="button button-primary ico-button logotype">
          <svg width="14" height="17" viewBox="0 0 14 17" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 13H10V7H14L7 0L0 7H4V13ZM0 15H14V17H0V15Z"/>
          </svg>
          <p>UPLOAD</p>
        </button>
      </div>
      <button class="button button-secondary add">ADD</button>
    </section>
    <form action="" style="display: none;">
      <input type="file" name="Subsite Image" id="Subsite-Image" accept="image/jpeg">
      <input type="file" name="Logo" id="Logo" accept="image/png">
      <img src="" class="logo"/>
    </form>
  </div>
  <div class="overlay"></div>
`
class NewSubsiteModal extends HTMLElement {
  static observedAttributes = ["sitecode"]

  constructor() {
    super()
    const clone = template.content.cloneNode(true)
    this.root = this.attachShadow({ mode: "closed" })
    this.root.append(clone)
    this.modalNode = this.root.querySelector("#New-Children-Website-Modal")
    this.subsiteTitleInput = this.root.querySelector(
      "modal-text-input[name='Subsite Title']"
    )
    this.subsitePictureInput = this.root.querySelector(
      "modal-picture-input[name='Subsite Picture']"
    )
    this.overlay = this.root.querySelector(
      "#New-Children-Website-Modal + .overlay"
    )
    this.submitButtonNode = this.root.querySelector("button.add")
    this.logoButtonNode = this.root.querySelector("button.logotype")
    this.logoPictureNode = this.root.querySelector(".picture img")
    this.logoInput = this.root.querySelector("form input[name='Logo']")
    this.logoFile = null
    this.logoMaxFileSize = 500_000
    this.sitecode = null

    this.formData = new FormData()
    this.requestExists = false
  }

  connectedCallback() {
    this.subsiteTitleInput.setValidationRegex(/^.{4,24}$/i)
    this.logoButtonNode.addEventListener("click", () => this.logoInput.click())
    this.logoInput.addEventListener("change", (e) =>
      this.setLogo(e.target.files[0])
    )
    this.setSubmitButton(this.submitButtonNode)
    this.overlay.addEventListener("click", () => this.close())
    // this.siteCode = "TEST" // REMOVE ON PRODUCTION
  }

  attributeChangedCallback(attribute, oldValue, newValue) {
    this[attribute] = newValue
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
    this.logoFile = null
    this.subsiteTitleInput.value = null
    this.subsitePictureInput.flush()
    this.removeLogo()
    this.restoreLogoButtonLabel()
  }

  setLogo(file) {
    const reader = new FileReader()
    if (file.size <= this.logoMaxFileSize && file.type === "image/png") {
      const label = file.name.substring(0, 4).concat(".png")
      reader.readAsDataURL(file)
      reader.onload = () => {
        this.logoButtonNode.querySelector("p").textContent = label
        this.logoFile = file
        this.logoPictureNode.src = reader.result
        this.logoPictureNode.style.visibility = "visible"
      }
    } else {
      // console.error("File for logo is either too large or of an invalid format")
    }
  }

  setSiteCode(siteCode) {
    this.siteCode = siteCode
  }

  setSubmitButton(buttonNode) {
    buttonNode.addEventListener("click", () => {
      this.submit()
    })
  }

  submit() {
    if(!this.validateModal()) {
      return
    }
    
    const url = "./hub.php"
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

  makeRequestBody() {
    const pictureData = this.subsitePictureInput.getPictureData()
    this.formData.append("__PUT", true)
    this.formData.append("__SUBTITLE", this.subsiteTitleInput.value)
    this.formData.append("__SITE_CODE", this.sitecode)
    this.formData.append("__LOGO", this.logoFile)
    this.formData.append("__PICTURE", pictureData.file)
    this.formData.append("__ORIGIN", pictureData.coords)
    this.formData.append("__SCALE", pictureData.scale)

    return this.formData
  }

  removeLogo() {
    this.logoPictureNode.src = ""
    this.logoPictureNode.style.visibility = null
  }

  restoreLogoButtonLabel() {
    let defaultLabel = "UPLOAD"
    this.logoButtonNode.querySelector("p").textContent = defaultLabel
  }

  validateModal() {
    if (
      this.logoFile &&
      this.subsitePictureInput.file &&
      this.subsiteTitleInput.value &&
      this.sitecode
    ) {
      return true
    }
    return false
  }
}

customElements.define("new-subsite-modal", NewSubsiteModal)
