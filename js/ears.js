export function setEarsForSelection() {
  let selection_toolbars = document.querySelectorAll(".toolbar.selection")

  selection_toolbars.forEach((element) => {
    let actualData = element.getAttribute("data-display")
    // let optionActive = element.querySelector('.option--active');
    let displayBar = element.querySelector(".label")
    // console.log(optionsList);

    element.addEventListener("click", function (event) {
      let optionActive = element.querySelector(".option--active")

      this.classList.toggle("selection--options-active")

      // console.log(event.target);
      if (
        event.target.tagName == "LI" &&
        event.target.getAttribute != actualData
      ) {
        let optionSelected = event.target
        optionSelected.classList.add("option--active")
        displayBar.innerHTML = optionSelected.innerHTML
        element.setAttribute(
          "data-display",
          optionSelected.getAttribute("data-display")
        )

        if (optionActive) optionActive.classList.remove("option--active")

        // console.log();
      }
    })
  })
}

export function setEarsForVendorSelection() {
  let selection_toolbars = document.querySelectorAll(".toolbar.vendor-input")

  selection_toolbars.forEach((element) => {
    let mainBar = element.querySelector(".vendor__input")

    // Focus & Blur Handlers..
    element.querySelector("input").addEventListener("focusin", function () {
      element.classList.add("visible-menu")
    })
    // element.querySelector('input').addEventListener('focusout', function(e) {
    // element.classList.remove('visible-menu');
    // });

    // Control The Binding Of Information Between MainBar And List Item Elements...
    element.addEventListener("click", function (e) {
      // console.log(e.target);

      if (e.target.tagName == "LI") {
        // console.warn(e);
        let data = e.target.getAttribute("data-display")
        let newData = data.replace("@", "")
        // mainBar.setAttribute('value', '');
        mainBar.value = ""
        mainBar.setAttribute("placeholder", data)
        element.setAttribute("data-display", data)
        element.classList.remove("visible-menu")

        element.querySelector(
          ".vendor__avatar img"
        ).src = `../assets/vendors/${newData}.png`
      } else if (e.target.parentNode.tagName == "LI") {
        let data = e.target.parentNode.getAttribute("data-display")
        let newData = data.replace("@", "")
        // mainBar.setAttribute('value', '');
        mainBar.value = ""
        mainBar.setAttribute("placeholder", data)
        element.setAttribute("data-display", data)
        element.classList.remove("visible-menu")

        element.querySelector(
          ".vendor__avatar img"
        ).src = `../assets/vendors/${newData}.png`
      }
    })

    // Controls The Characters That The User Can Enter...
    element.addEventListener("keydown", function (e) {
      let reg = /[a-zA-Z0-9]/
      if (!reg.test(e.key)) {
        e.preventDefault()
      }
    })

    // Flushes Attached Information When Text Input Gets Dirty..
    element.querySelector("input").addEventListener("change", function () {
      mainBar.setAttribute("value", "")
      mainBar.setAttribute("placeholder", "@VENDOR")
      element.setAttribute("data-display", "")
      element.querySelector(".vendor__avatar img").src = ""
    })
  })
}

export function fillSelectionOptions(selectionNode, requestTag) {
  let request = new XMLHttpRequest()
  let data = new FormData()
  data.append("__PULL", "1")
  data.append(requestTag, "1")

  request.open("POST", "./hub.php")
  request.send(data)

  request.onreadystatechange = function () {
    if (request.readyState == 4 && request.status == 200) {
      let rows = JSON.parse(request.response)
      for (const row of rows) {
        let listItem = document.createElement("li")
        listItem.setAttribute("data-display", row["SITE_CODE"])
        listItem.classList.add("option")
        listItem.innerHTML = row["SITE_TITLE"]
        selectionNode.querySelector(".options-list").appendChild(listItem)
      }
      // console.log(rows);
    }
  }
}
