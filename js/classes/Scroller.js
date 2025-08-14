export class Scroller {
  constructor(node, options) {
    this.node = node
    this.parent = node.parentElement
    this.parent.coords = this.parent.getBoundingClientRect()
    this.visibleArea = options.visibleArea ?? {
      X: this.parent.coords.width,
      Y: this.parent.coords.height,
    }
    this.stepSize = options.stepSize
    this.currentStep = 0
    this.maxStep = {
      X: Math.round(
        (this.node.offsetHeight - this.visibleArea.X) / this.stepSize
      ),
      Y: Math.round(
        (this.node.offsetHeight - this.visibleArea.Y) / this.stepSize
      ),
    }

    node.onwheel = (e) => {
      e.preventDefault()
      if (e.deltaY > 0) {
        this.scrollDown()
      } else {
        this.scrollUp()
      }
    }
  }

  scrollDown() {
    if (Math.abs(this.currentStep) < this.maxStep.Y) {
      this.currentStep--
      this.node.style.transform = `translateY(${
        this.currentStep * this.stepSize
      }px)`
    }
  }

  scrollUp() {
    if (this.currentStep < 0) {
      this.currentStep++
      this.node.style.transform = `translateY(${
        this.currentStep * this.stepSize
      }px)`
    }
  }
}
