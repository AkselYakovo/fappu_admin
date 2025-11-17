import { userEvent } from "@testing-library/user-event"
import { fireEvent } from "@testing-library/dom"
import ModalPictureInput from "../js/classes/ModalPictureInput.js"

document.body.innerHTML = `
  <div id="parent"></div>
`

describe("initial behavior", () => {
  let pictureInput
  const parent = document.querySelector("div#parent")

  beforeEach(() => {
    const customElement = document.createElement("modal-picture-input")
    pictureInput = customElement
    parent.append(customElement)
  })

  afterEach(() => {
    parent.innerHTML = ""
  })

  test("the existence of the main node", async () => {
    await customElements.whenDefined("modal-picture-input").then(() => {
      const node = pictureInput.root

      expect(node).toBeDefined()
    })
  })

  test("initial values", async () => {
    await customElements.whenDefined("modal-picture-input").then(() => {
      expect(pictureInput.scale).toBe(1)
      expect(pictureInput.coords).toBeNull()
      expect(pictureInput.file).toBeNull()
    })
  })
})

describe("file uploading", () => {
  let pictureInput
  const parent = document.querySelector("div#parent")

  beforeEach(() => {
    const customElement = document.createElement("modal-picture-input")
    pictureInput = customElement
    parent.append(customElement)
  })

  afterEach(() => {
    parent.innerHTML = ""
  })

  test("file upload", async () => {
    await customElements.whenDefined("modal-picture-input").then(() => {
      const mockPicture = new File([], "TEST.jpeg", { type: "image/jpeg" })

      fireEvent.change(pictureInput.fileInputNode, {
        target: {
          files: [mockPicture],
        },
      })

      expect(pictureInput.file).toBe(mockPicture)
    })
  })

  it("prevents upload of an invalid file format", async () => {
    await customElements.whenDefined("modal-picture-input").then(() => {
      const mockPicture = new File([], "TEST.png", { type: "image/png" })

      fireEvent.change(pictureInput.fileInputNode, {
        target: {
          files: [mockPicture],
        },
      })

      expect(pictureInput.file).toBeNull()
    })
  })

  it.skip("prevents upload of an overly heavy file", async () => {
    await customElements.whenDefined("modal-picture-input").then(() => {
      let data = ""
      const size = 3 * 1024 * 1024

      for (let i = 0; i < size; i++) {
        data += "0"
      }

      const mockPicture = new Blob([data], {
        type: "image/jpeg",
      })

      fireEvent.change(pictureInput.fileInputNode, {
        target: {
          files: [mockPicture],
        },
      })

      expect(pictureInput.file).toBeNull()
    })
  })
})

describe("picture transformations", () => {
  let pictureInput, mockedPicture
  const parent = document.querySelector("div#parent")

  beforeAll(() => {
    let data = ""
    const fileSize = 1024 * 64

    for (let i = 0; i < fileSize; i++) {
      data += "0"
    }

    mockedPicture = new File([data], "TEST.jpeg", { type: "image/jpeg" })
  })

  beforeEach(() => {
    const customElement = document.createElement("modal-picture-input")
    pictureInput = customElement
    parent.append(customElement)

    fireEvent.change(pictureInput.fileInputNode, {
      target: {
        files: [mockedPicture],
      },
    })
  })

  afterEach(() => {
    parent.innerHTML = ""
  })

  it("zooms in the image", async () => {
    await customElements.whenDefined("modal-picture-input").then(() => {
      let actualScale = null

      for (let i = 0; i < 3; i++) {
        fireEvent.click(pictureInput.controls.zoomIn)
      }

      actualScale = pictureInput.zoom.getScale()

      expect(actualScale).toBe("1.3")
    })
  })

  it("zooms in the image (max)", async () => {
    await customElements.whenDefined("modal-picture-input").then(() => {
      let actualScale = null
      const tooManyTimes = 15
      const maxScale = "2.0"

      for (let i = 0; i < tooManyTimes; i++) {
        fireEvent.click(pictureInput.controls.zoomIn)
      }

      actualScale = pictureInput.zoom.getScale()

      expect(actualScale).toBe(maxScale)
    })
  })

  it("zooms in the image (random 1-9 number)", async () => {
    await customElements.whenDefined("modal-picture-input").then(() => {
      let actualScale = null
      const randomNumber = Number.parseInt(Math.random() * 10)
      const expectedScale = "1" + "." + randomNumber

      for (let i = 0; i < randomNumber; i++) {
        fireEvent.click(pictureInput.controls.zoomIn)
      }

      actualScale = pictureInput.zoom.getScale()

      expect(actualScale).toBe(expectedScale)
    })
  })

  it("zooms out the image", async () => {
    await customElements.whenDefined("modal-picture-input").then(() => {
      let actualScale = null

      for (let i = 0; i < 5; i++) {
        fireEvent.click(pictureInput.controls.zoomIn)
      }

      for (let i = 0; i < 5; i++) {
        fireEvent.click(pictureInput.controls.zoomOut)
      }

      actualScale = pictureInput.zoom.getScale()

      expect(actualScale).toBe("1.0")
    })
  })

  it("zooms out the image (max)", async () => {
    await customElements.whenDefined("modal-picture-input").then(() => {
      let actualScale = null
      const tooManyTimes = 15
      const minScale = "1.0"

      for (let i = 0; i < 5; i++) {
        fireEvent.click(pictureInput.controls.zoomIn)
      }

      for (let i = 0; i < tooManyTimes; i++) {
        fireEvent.click(pictureInput.controls.zoomOut)
      }

      actualScale = pictureInput.zoom.getScale()

      expect(actualScale).toBe(minScale)
    })
  })

  it("zooms out the image (random 1-9 number)", async () => {
    await customElements.whenDefined("modal-picture-input").then(() => {
      let actualScale = null
      const randomNumber = Number.parseInt(Math.random() * 8) + 1
      const expectedScale = "1" + "." + (10 - randomNumber)

      for (let i = 0; i < 10; i++) {
        fireEvent.click(pictureInput.controls.zoomIn)
      }

      for (let i = 0; i < randomNumber; i++) {
        fireEvent.click(pictureInput.controls.zoomOut)
      }

      actualScale = pictureInput.zoom.getScale()

      expect(actualScale).toBe(expectedScale)
    })
  })
})

describe("flushing", () => {
  let pictureInput
  const parent = document.querySelector("div#parent")

  beforeEach(() => {
    const customElement = document.createElement("modal-picture-input")
    pictureInput = customElement
    parent.append(customElement)
  })

  afterEach(() => {
    parent.innerHTML = ""
  })

  it("flushes out the file and settings", async () => {
    await customElements.whenDefined("modal-picture-input").then(() => {
      const mockPicture = new File([], "TEST.jpeg", { type: "image/jpeg" })

      fireEvent.change(pictureInput.fileInputNode, {
        target: {
          files: [mockPicture],
        },
      })

      fireEvent.click(pictureInput.controls.remove)

      expect(pictureInput.file).toBeNull()
      expect(pictureInput.coords).toBeNull()
      expect(pictureInput.zoom.getScale()).toBe("1.0")
    })
  })
})
