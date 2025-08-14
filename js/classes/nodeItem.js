export function nodeItem(node) {
  if (!(node instanceof HTMLElement))
    throw new Error("Not an HTML DOM Element.")

  this.node = node
}

nodeItem.prototype.toString = function () {
  let attributes = this.node.attributes
  let openTag = `<${this.node.nodeName.toLowerCase()} ${stringifyAttr(
    attributes
  )}>`
  let closeTag = `</${this.node.nodeName.toLowerCase()}>`
  return `${openTag} 
    ${this.node.innerHTML} 
    ${closeTag}`
}

function stringifyAttr(obj) {
  let str = ""
  for (const prop of obj) {
    str += ` ${prop.name}="${prop.value}"`
  }
  return str
}
