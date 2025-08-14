import { draggableImage, getOrigin } from "./draggableImage.js"
import { zoomableImage } from "./zoomableImage.js"

export class Picture {
  constructor(inputNode) {
    this.node = inputNode
    this.imageNode = this.node.querySelector("img")
    this.file = null
    this.drag = new draggableImage(this.imageNode)
    this.zoom = new zoomableImage(this.imageNode)
    this.coords = undefined

    let removeButton = inputNode.querySelector(".remove")
    let zoomInButton = inputNode.querySelector(".zoom-in")
    let zoomOutButton = inputNode.querySelector(".zoom-out")

    this.setRemoveButton(removeButton)
    this.setZoomInButton(zoomInButton)
    this.setZoomOutButton(zoomOutButton)

    // new zoomableImage(this.imageNode);
  }

  setZoomInButton(zoomNode) {
    zoomNode.addEventListener("click", () => {
      this.zoom.zoomIn()
    })
  }

  setZoomOutButton(zoomNode) {
    zoomNode.addEventListener("click", () => {
      this.zoom.zoomOut()
    })
  }

  setRemoveButton(buttonNode) {
    buttonNode.addEventListener("click", () => {
      this.imageNode.src = ""

      this.hidePicture()
      this.hideControls()

      this.removeFile()
    })
  }

  setPicture(image64) {
    this.imageNode.src = image64
    this.showPicture()
    this.showControls()
  }

  setFile(file) {
    if (file.type == "image/jpeg") {
      this.file = file
    } else throw new Error("Invalid Image Type Passed.")
  }

  setCoords(coords) {
    let regEx = /-?\d{1,}\/-?\d{1,}/i
    if (regEx.test(coords)) {
      this.coords = coords
    } else throw new Error("Invalid Coordenates Passed.")
  }

  // Getters.

  getFile() {
    return this.file
  }

  getScale() {
    return this.zoom.actualScale
  }

  getCoords() {
    let origin = getOrigin(this.imageNode.parentElement, this.imageNode)
    return origin.X + "/" + origin.Y
  }

  // Has Methods.

  hasFile() {
    if (this.file) return true

    return false
  }

  // Show Methods.

  showPicture() {
    this.imageNode.style.display = "block"
  }

  showControls() {
    let controls = this.node.querySelector(".controls")
    controls.style.display = "block"
  }

  // Hide Methods.

  hideControls() {
    let controls = this.node.querySelector(".controls")
    controls.style.display = "none"
  }

  hidePicture() {
    this.imageNode.style.display = "none"
  }

  // Extra Methods.

  removeFile() {
    this.file = undefined
  }
}
