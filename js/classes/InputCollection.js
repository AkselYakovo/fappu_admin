class InputCollection {
  static createInput(formFieldNode) {
    const input = new Input(formFieldNode)
    return input
  }

  static createSpecialInput(node) {
    const specialInput = new SpecialInput(node)
    return specialInput
  }

  constructor() {
    this.collection = new Array()
  }

  add(inputObject) {
    if (
      typeof inputObject.label === "string" &&
      inputObject.label !== "" &&
      inputObject.updateValue instanceof Function &&
      inputObject.validationExp instanceof RegExp &&
      inputObject.node instanceof HTMLElement
    ) {
      this.collection.push(inputObject)
    } else {
      throw new Error("Input object lacks properties")
    }
  }

  isValid() {
    if (!this.collection.length)
      throw new Error("Modal's input collection is empty")

    const invalidInputs = this.collection.filter((currentInput) => {
      currentInput.updateValue()
      if (!currentInput.validationExp.test(currentInput.value || ""))
        return currentInput
    })

    if (this.collection.length === 0 || invalidInputs.length > 0) return false

    return true
  }

  find(label) {
    const item = this.collection.find((i) => i.label === label)
    if (!item) return false

    return item
  }

  remove(label) {
    const itemIndex = this.collection.findIndex((i) => i.label === label)
    if (itemIndex < 0) return false

    this.collection.splice(itemIndex, 1)

    return true
  }
}

class Input {
  constructor(node) {
    this.node = node
    this.validationExp = null
    this.label = node.getAttribute("name")
    this.value = node.value
    this.updateValue = () => {
      this.value = this.node.value
    }
  }

  isValid() {
    this.updateValue()
    return this.validationExp.test(this.value || "")
  }

  setValidationExp(validationExp) {
    this.validationExp = validationExp
  }

  setLabel(label) {
    this.label = label
  }
}

class SpecialInput {
  constructor(node) {
    this.node = node
    this.validationExp = null
    this.label = null
    this.value = node.value
    this.updateValue = null
  }

  isValid() {
    this.updateValue()
    return this.validationExp.test(this.value || "")
  }

  setLabel(label) {
    this.label = label
  }

  setValidationExp(validationExp) {
    this.validationExp = validationExp
  }

  setUpdateValueCallback(updateValueCallback) {
    this.updateValue = () => {
      this.value = updateValueCallback(this.node)
    }
  }
}

export default InputCollection
