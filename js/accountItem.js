export class accountItem {
  constructor(cardNode) {
    this.nickname = cardNode.querySelector("input").value
    this.vendor = cardNode.querySelector(
      "a.vendor-link .vendor__label"
    ).innerHTML
    this.node = cardNode
  }
}

export function filterCollection(collection, string) {
  let regEx = new RegExp(`^.*(${string}).*$`, "im")
  // console.log(regEx);
  let filteredCollection = {}
  filteredCollection.length = 0
  let index = 0
  // collection.forEach( (item, index) => {
  for (let i = 0; i < collection.length; i++) {
    let actualVendor = collection[i].vendor
    if (regEx.test(actualVendor)) {
      filteredCollection[index] = collection[i]
      filteredCollection.length++
      index++
    }
  }
  return filteredCollection
}
