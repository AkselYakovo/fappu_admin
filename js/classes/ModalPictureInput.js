import { draggableImage, getOrigin } from "./draggableImage.js"
import { zoomableImage } from "./zoomableImage.js"

const template = document.createElement("template")
template.innerHTML = `
  <style>
    @import url("../../css/style.css");
    :host {
      position: relative;
      overflow: hidden;

      .controls {
        position: absolute;
        top: 25px;
        left: 50%;
        z-index: 2;
        display: none;
        transform: translateX(-50%);
      }

      button.input {
        width: 100%;
        height: 100%;
        border: 0;
        background-color: #E3E3E3;
        cursor: pointer;

        &:hover {
          svg {
            fill: #000000;
          }
          p {
            color: #000000;
          }
        }

        svg {
          fill: #838383;
          transition: fill 125ms linear;
        }

        p {
          padding-top: 80px;
          font-family: "Roboto Condensed Regular";
          font-size: 28px;
          letter-spacing: 0.05em;
          color: #838383;
          transition: color 125ms linear;
        }
      }

      img.image {
        display: none;
        width: auto;
        height: 100%;
      }
    }
  </style>
    <div class="controls">
      <button class="button button-secondary button-small remove">REMOVE</button>
      <button class="button button-secondary button-small zoom-in">ZOOM IN</button>
      <button class="button button-secondary button-small zoom-out">ZOOM OUT</button>
    </div>
    <img src="" alt="" class="image" draggable="false" />
    <button class="input">
      <svg width="84" height="84" viewBox="0 0 84 84" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M64 76H8V20H44V12H8C3.6 12 0 15.6 0 20V76C0 80.4 3.6 84 8 84H64C68.4 84 72 80.4 72 76V40H64V76ZM32.84 63.32L25 53.88L14 68H58L43.84 49.16L32.84 63.32ZM72 12V0H64V12H52C52.04 12.04 52 20 52 20H64V31.96C64.04 32 72 31.96 72 31.96V20H84V12H72Z"
        />
      </svg>
      <p>SELECT A PICTURE</p>
    </button>
    <form style="display: none;">
      <input type="file" name="Files" id="" accept="image/jpeg" maxlength="1"/>
    </form>
`

class ModalPictureInput extends HTMLElement {
  constructor() {
    super()
    const clone = template.content.cloneNode(true)
    this.root = this.attachShadow({ mode: "open" })
    this.root.append(clone)
    this.coords = null
    this.scale = 1
    this.origin = null
    this.controls = {}
    this.imageNode = this.root.querySelector("img")
    this.controls.node = this.root.querySelector(".controls")
    this.controls.remove = this.root.querySelector(".controls .remove")
    this.controls.zoomIn = this.root.querySelector(".controls .zoom-in")
    this.controls.zoomOut = this.root.querySelector(".controls .zoom-out")
    this.fileInputButtonNode = this.root.querySelector("button.input")
    this.fileInputNode = this.root.querySelector("form > input[name='Files']")
    this.file = null
    this.maxFileSize = 2_500_000
    this.zoom = new zoomableImage(this.imageNode)
    this.drag = new draggableImage(this.imageNode)
  }

  connectedCallback() {
    this.setTarget(this.fileInputNode)
    this.setZoomInButton()
    this.setZoomOutButton()
    this.setRemoveButton()
    this.fileInputNode.addEventListener("change", (e) => {
      const file = e.target.files[0]
      if (this.validatePicture(file)) {
        this.setDisplayPicture(file)
      } else {
        // console.error("Invalid picture submitted")
      }
    })
  }

  setTarget(Node) {
    if (
      Node instanceof HTMLInputElement &&
      Node.getAttribute("type") === "file"
    ) {
      this.fileInputButtonNode.addEventListener("click", () => {
        Node.click()
      })
    }
  }

  setCoords(coords) {
    let regEx = /-?\d{1,}\/-?\d{1,}/i
    if (regEx.test(coords)) {
      this.coords = coords
    } else {
      // console.error("Invalid coords passed.")
    }
  }

  setDisplayPicture(file) {
    const fileReader = new FileReader()
    fileReader.readAsDataURL(file)
    fileReader.onload = () => {
      this.setPicture(fileReader.result)
      this.showPicture()
      const pictureOrigin = getOrigin(this.root.host, this.imageNode)
      this.setCoords(`${pictureOrigin.X}/${pictureOrigin.Y}`)
      this.setCoords(0, 0)
      this.showControls()
      this.file = file
    }
  }

  setPicture(image64) {
    this.imageNode.src = image64
  }

  setZoomInButton() {
    this.controls.zoomIn.addEventListener("click", () => {
      this.zoom.zoomIn()
    })
  }

  setZoomOutButton() {
    this.controls.zoomOut.addEventListener("click", () => {
      this.zoom.zoomOut()
    })
  }

  setRemoveButton() {
    this.controls.remove.addEventListener("click", () => {
      this.flush()
    })
  }

  showPicture() {
    this.imageNode.style.display = "block"
  }

  showControls() {
    this.controls.node.style.display = "block"
  }

  flush() {
    this.imageNode.src = ""
    this.imageNode.style = "display: none;"
    this.imageNode.style.transition = null
    this.controls.node.style = "display: none;"
    this.file = null
    this.coords = null
    this.zoom.setScale(1)
  }

  isValid() {
    if (!this.file) return false
    if (!this.coords) return false
    return true
  }

  validatePicture(pictureFile) {
    if (
      pictureFile.type === "image/jpeg" &&
      pictureFile.size <= this.maxFileSize
    ) {
      this.file = pictureFile
      return true
    } else {
      return false
    }
  }

  getPictureData() {
    const centerPoint = getOrigin(this.root.host, this.imageNode)
    const data = {
      scale: this.zoom.getScale(),
      file: this.file,
      coords: `${centerPoint.X}/${centerPoint.Y}`,
    }

    return data
  }
}

customElements.define("modal-picture-input", ModalPictureInput)

export default ModalPictureInput
