/* eslint-disable no-unused-vars */
export function listingASC(collection) {
  // This is Essentially a Bubble Sort... (Awful For Efficiency BTW);
  for (let index in collection) {
    for (let i = 0; i < collection.length - 1; i++) {
      let actualObj = collection[i]
      let nextObj = collection[i + 1]
      // let accounts = collection[index].accounts;
      if (actualObj.accounts > nextObj.accounts) {
        collection[i + 1] = actualObj
        collection[i] = nextObj
      }
    }
  }
  return collection
}

export function listingDESC(collection) {
  // This is Essentially a Bubble Sort... (Awful For Efficiency BTW);
  for (let index in collection) {
    for (let i = 0; i < collection.length - 1; i++) {
      let actualObj = collection[i]
      let nextObj = collection[i + 1]
      // let accounts = collection[index].accounts;
      if (actualObj.accounts < nextObj.accounts) {
        collection[i + 1] = actualObj
        collection[i] = nextObj
      }
    }
  }
  // }
  return collection
}

export function collectionToList(collection) {
  let list = {}
  list.length = 0
  collection.forEach((item, index) => {
    let innerList = {}
    innerList.node = item
    innerList.title = item.querySelector("h2").innerHTML
    innerList.accounts = Number.parseInt(
      item.querySelector("small").innerHTML.match(/\d{1,}/)[0]
    )
    list[index] = innerList
    list.length++
  })
  return list
}
