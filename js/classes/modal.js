export class Modal {
  constructor(modalID) {
    this.node = document.querySelector(`#${modalID}`)
    this.overlay = document.querySelector(`#${modalID} + .overlay`)
    this.formData = new FormData()
    this.inputCollection = new Map()

    this.overlay.addEventListener("click", () => {
      this.close()
    })
  }

  // Open Method.
  open() {
    this.node.classList.add("visible")
  }
  // Close Method.
  close() {
    const handler = () => {
      this.node.classList.remove("visible")
      this.node.classList.remove("hide")
      this.node.removeEventListener("animationend", handler)
    }

    this.node.addEventListener("animationend", handler)
    this.node.classList.add("hide")
  }

  // Upload Information To The Server.
  upload() {
    let request = new XMLHttpRequest()
    request.open("POST", "./hub.php")

    if (this.formData.entries()) {
      request.send(this.formData)
    }

    request.onreadystatechange = () => {
      if (request.status == 200 && request.readyState == 4) {
        // console.log(request.response)
      }
    }
  }

  // Add Form Data.
  add(key, value) {
    if (key && value) this.formData.append(key, value)
  }

  //
  // addInput(inputNode) {
  //     if ( inputNode instanceof HTMLInputElement )
  //         this.inputCollection.add(this.inputCollection.size + 1, inputNode);
  // }
}
