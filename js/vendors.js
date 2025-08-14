export function checkVendors(vendorNode, vendorID) {
  let request = new XMLHttpRequest()
  let data = new FormData()
  data.append("__PULL", "1")
  data.append("__VENDORS", "1")
  data.append("__QUERY", vendorID)

  request.open("POST", "./hub.php")
  request.send(data)

  request.onreadystatechange = function () {
    if (request.readyState == 4 && request.status == 200) {
      vendorNode.querySelector(".options-list").innerHTML = ""
      let rows = JSON.parse(request.response)

      for (const row of rows) {
        let listItem = document.createElement("li")
        listItem.setAttribute("data-display", `@${row["ID"]}`)
        listItem.classList.add("option")
        listItem.innerHTML = `
          <figure class='vendor__avatar'>
              <img src='../assets/vendors/${row["ID"]}.png' >
          </figure>
          <span class='vendor__label'>@${row["ID"]}</span>
        `
        vendorNode.querySelector(".options-list").appendChild(listItem)
      }
    }
  }
}
