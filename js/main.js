import { getDaysLeft, getDaysAgo } from "./date.js"
import {
  setEarsForSelection,
  setEarsForVendorSelection,
  fillSelectionOptions,
} from "./ears.js"
import { collectionToList, listingASC, listingDESC } from "./arrange.js"
import { accountItem, filterCollection } from "./accountItem.js"
// import { zoomableImage } from './classes/zoomableImage.js';
import { validationFlag } from "./classes/validationFlag.js"
import { Modal } from "./classes/modal.js"
import { Factory } from "./factory.js"
import { Pagination } from "./pagination.js"
// import { nodeItem } from "./classes/nodeItem.js";

// @ General use functions.
// cleanPriceInput()
// Request()

function Request(data) {
  if (typeof data != "object") return false

  let request = new XMLHttpRequest()
  let d = new FormData()

  for (let key in data) d.append(key, data[key])

  request.open("POST", "hub.php")
  request.send(d)

  return request
}

// Header open/close menu.
let header_menu = document.getElementById("header_menu")

header_menu.addEventListener("click", function () {
  this.classList.toggle("menu--active")
})

// Set click handler for .toolbar.selection elements.
if (document.querySelector(".toolbar.selection")) {
  setEarsForSelection()
}
// Set handler(s) for .toolbar.vendor-input element.
if (document.querySelector(".toolbar.vendor-input")) {
  setEarsForVendorSelection()
}

// # Modals config sections.
// # MODAL INDEX:
// 1. NEW ACCOUNT.
// 2. EDIT ACCOUNT.
// 3.

// # SECTIONING BEGINS.
// # INDEX:
// # 1. website.php (page).
// # 2. accounts.php (page).
// # 3. .php (page).
// # . .php (page).
// # . .php (page).
// # . .php (page).

// # website.php (landing).
// # Only executes within website.php landing page.
if (document.querySelector("article.websites-listing")) {
  let originalWebsitesCollection = document.querySelectorAll("div.website-row")
  let wrapper = document.querySelector("section.content")
  document
    .querySelector(".toolbar.searchbox input")
    .addEventListener("keyup", function () {
      let input = this.value
      let filteredCollection = []

      for (let element of originalWebsitesCollection) {
        let title = element.querySelector("h4.title").innerHTML
        let reg = new RegExp(`^.*(${input}).*$`, "i")

        if (reg.test(title)) filteredCollection.push(element)
      }
      // console.log(filteredCollection)

      if (filteredCollection.length) {
        wrapper.innerHTML = ""
        for (let filteredElement of filteredCollection)
          wrapper.append(filteredElement)
      } else {
        // for(let originalElement of originalWebsitesCollection) {
        //     wrapper.append(originalElement);
        // }
      }
    })
}

// # website.php (single).
// # Will only run when the link variable "website" contains a valid site code.
if (document.querySelector(".screens-wrap")) {
  let screens_wrap = document.querySelector(".screens-wrap")
  let screens_strip = document.querySelector(".screens-strip")

  // Screen strip slidding handler code.
  screens_wrap.addEventListener("mousedown", function (e) {
    let cursorX = e.pageX
    let position_left = this.style.left ? Number.parseInt(this.style.left) : "0"
    let total_path = screens_strip.offsetWidth - screens_wrap.offsetWidth + 255

    document.onmousemove = (e) => {
      let new_position_left = position_left + -(cursorX - e.pageX)

      if (new_position_left <= 0 && -new_position_left <= total_path)
        this.style.left = new_position_left + "px"
      else if (new_position_left == 0) window // Do nothing.
      else if (new_position_left > 0) this.style.left = "0px"
    }
  })

  document.addEventListener("mouseup", function () {
    document.onmousemove = function () {}
  })
}

// # `website.php` (landing || single)
if (document.querySelector("new-subsite-modal")) {
  const goBackButton = document.querySelector(".header button.go-back")
  const newLogoButton = document.querySelector("button[name='New Logo']")
  const fileInputNode = document.querySelector("input[name='New Logo']")

  goBackButton.addEventListener("click", () => {
    let url = window.location.toString()
    let currentPage = url.toLowerCase().lastIndexOf("/website/")
    window.location = url.substring(0, currentPage + "/website/".length)
  })

  newLogoButton?.addEventListener("click", () => fileInputNode.click())

  fileInputNode?.addEventListener("change", function () {
    let file = this.files[0],
      site = document.querySelector("h2.site-code").innerHTML,
      logoImage = document.querySelector("figure.site-logo img"),
      data = new FormData(),
      url = "../v1/websites/logo"

    const image = new Image()
    const body = {
      method: "POST",
      body: data,
    }

    data.append("__SITE_CODE", site)
    data.append("__NEW_LOGO", file)

    image.onload = function () {
      const aspectRatio = image.height / image.width

      if (aspectRatio > 0.7 && aspectRatio <= 1) {
        fetch(url, body)
      } else {
        // console.error('Image has an invalid aspect ratio');
      }
    }

    if (file.type == "image/png" && file.size <= 300000) {
      let reader = new FileReader()
      reader.readAsDataURL(file)

      reader.onload = function () {
        image.src = reader.result
        logoImage.src = reader.result
      }
    } else {
      // console.error('Invalid file format.');
    }
  })
}

// Pagination for website screens.
if (
  document.querySelector(".screens-wrap") &&
  document.querySelector(".toolbar.pagination")?.childElementCount
) {
  // Pagination function constructor.
  let Pagination = function () {}

  Pagination.prototype.max = 8
  Pagination.prototype.getRows = function (numPage = 0) {
    // console.log(this.records)
    let records = []
    for (let i = 0; i < this.max; i++) {
      let actualIndex = (numPage - 1) * this.max + i
      if (this.records[actualIndex]) records.push(this.records[actualIndex])
      else break
    }
    // console.log(records)
    return records
  }

  Pagination.prototype.setRecords = function (records) {
    this.records = records
  }

  let site = document.querySelector("h2.site-code").innerHTML
  let pagination = new Pagination()

  pagination.rewrite = function (recordCollection) {
    let strip = document.querySelector(".screens-strip")
    strip.innerHTML = ""

    let squeleton = ""
    for (let record of recordCollection) {
      squeleton += `
        <div class="screen" style="background-image: url('../assets/screens/${site}/${record}.jpg')">
          <img src="../assets/subsites_logos/${site}/${record}.png" alt="${record}logo" class="subsite-logo" draggable="false">
          <p class="title">${record}</p>
        </div>
      `
    }
    strip.innerHTML = squeleton
    document.querySelector(".screens-wrap").style.left = "0px"
  }

  let screens = new Promise((resolve, reject) => {
    const URL = `../v1/websites/${site}/screens`
    const options = {
      method: "GET",
    }

    fetch(URL, options).then((res) => {
      if (res.ok) resolve(res.json())
      else reject("Error with server")
    })
  })

  screens
    .then((response) => {
      if (response) pagination.setRecords(response)
      // else
      // console.log(response)
    })
    .catch(() => {
      // console.error(message)
    })

  // Set listener for pagination links.
  let paginationLinks = document.querySelectorAll(".toolbar.pagination a")

  paginationLinks.forEach((node) => {
    node.addEventListener("click", function (e) {
      e.preventDefault()

      let page = e.target.innerHTML
      let nodeActive = document.querySelector(
        ".toolbar.pagination .link--active"
      )

      nodeActive.classList.remove("link--active")
      e.target.parentElement.classList.add("link--active")
      pagination.rewrite(pagination.getRows(page))
    })
  })
}

// # accounts.php (landing).
// # fill .toolbar.selection element with websites listing.
if (document.querySelector("#Site-Selection")) {
  fillSelectionOptions(
    document.querySelector(".modal #Site-Selection"),
    "__WEBSITES"
  )
}

// # accounts.php (landing).
// Only executes within accounts.php.
if (document.querySelector("article.card-websites-accounts-listing")) {
  let websitesCollection = document.querySelectorAll(".website-accounts-row")
  let list = collectionToList(websitesCollection)
  // console.log(list);

  document
    .querySelector(".toolbar.selection")
    .addEventListener("click", function () {
      let data = this.getAttribute("data-display")

      if (data == "ASC") {
        // let ascendingList = listingASC(list);
        listingASC(list)
        document.querySelector("article section.content").innerHTML = "" // Flush content.
        // Append children to container.
        for (let i = 0; i < list.length; i++)
          document
            .querySelector("article section.content")
            .appendChild(list[i].node)
      } else if (data == "DESC") {
        // let ascendingList = listingDESC(list);
        listingDESC(list)
        document.querySelector("article section.content").innerHTML = "" // Flush content.
        // Append children to container.
        for (let i = 0; i < list.length; i++)
          document
            .querySelector("article section.content")
            .appendChild(list[i].node)
      }
    })
}

// # accounts.php (single).
// # Only executes within "accounts.php?website=".
if (document.querySelector("#Accounts-Card")) {
  let accountsCards = document.querySelectorAll(
    ".active-accounts-listing .account-row"
  )
  let inactiveAccountsCards = document.querySelectorAll(
    ".inactive-accounts-listing .account-row"
  )
  let closeButton = document.querySelector(".close-button")

  closeButton.onclick = function () {
    let url = window.location.toString()
    let currentPage = url.toLowerCase().lastIndexOf("/accounts/")
    window.location = url.substring(0, currentPage + "/accounts/".length)
    // console.warn(url);
  }

  let inactiveAccountsCollection = {}
  inactiveAccountsCollection.length = 0

  inactiveAccountsCards.forEach((card, index) => {
    inactiveAccountsCollection[index] = new accountItem(card)
    inactiveAccountsCollection.length++
  })

  let activeAccountsCollection = {}
  activeAccountsCollection.length = 0

  accountsCards.forEach((card, index) => {
    activeAccountsCollection[index] = new accountItem(card)
    activeAccountsCollection.length++
  })

  // console.log(inactiveAccountsCollection);

  let targets = document.querySelectorAll(".navigation > p")
  let activeAccountsTab = targets[0]
  let inactiveAccountsTab = targets[1]

  let vendorInput = document.querySelector(".toolbar.text-input input")

  // # accounts.php (single).
  // # Vendor text input handler(s).
  // + Avoid input of special characters.
  vendorInput.addEventListener("keydown", function (e) {
    let regEx = /\b/
    if (regEx.test(e.key)) {
      // console.log(e.key);
    } else {
      e.preventDefault()
    }
  })

  // # accounts.php (single).
  // # Vendor input typing handler.
  // + Update view by adding those cards whose vendor label math the query.
  vendorInput.addEventListener("keyup", function () {
    let input = this.value
    let activeAccountsWrapper = document.querySelector(
      ".content .active-accounts-listing"
    )
    let inactiveAccountsWrapper = document.querySelector(
      ".content .inactive-accounts-listing"
    )
    // console.log(this.value);
    activeAccountsWrapper.innerHTML = ""
    inactiveAccountsWrapper.innerHTML = ""
    let activeAccountsFiltered = filterCollection(
      activeAccountsCollection,
      input
    )
    let inactiveAccountsFiltered = filterCollection(
      inactiveAccountsCollection,
      input
    )
    // console.log(filteredCollection);

    // Append all filtered active cards.
    for (let i = 0; i < activeAccountsFiltered.length; i++)
      activeAccountsWrapper.appendChild(activeAccountsFiltered[i].node)

    // Append all filtered inactive cards.
    for (let i = 0; i < inactiveAccountsFiltered.length; i++)
      inactiveAccountsWrapper.appendChild(inactiveAccountsFiltered[i].node)
  })

  // # accounts.php (single).
  // # Active tab node.
  // + Activate active accounts tab.
  activeAccountsTab.addEventListener("click", function () {
    if (!this.classList.contains("active")) {
      this.classList.add("active")
      inactiveAccountsTab.classList.remove("active")
      document
        .querySelector("section.content")
        .classList.toggle("active-accounts")
      document
        .querySelector("section.content")
        .classList.toggle("inactive-accounts")
    }
  })

  // # accounts.php (single).
  // # Inactive tab node.
  // + Activate inactive accounts tab.
  inactiveAccountsTab.addEventListener("click", function () {
    if (!this.classList.contains("active")) {
      this.classList.add("active")
      activeAccountsTab.classList.remove("active")
      document
        .querySelector("section.content")
        .classList.toggle("active-accounts")
      document
        .querySelector("section.content")
        .classList.toggle("inactive-accounts")
    }
  })

  // # accounts.php (single).
  // # Collection of active accounts cards.
  // + Rewrite the date of each account card.
  for (const account of accountsCards) {
    let dateString = account.querySelector(".expiration-date").innerHTML
    let daysLeft = getDaysLeft(dateString)
    account.querySelector(".expiration-date").innerHTML = daysLeft
  }

  // Attach an event handler to each edit button.
  accountsCards.forEach((card) => {
    const editButton = card.querySelector(".edit")
    const accountID = editButton.getAttribute("data-display")

    editButton.addEventListener("click", function () {
      const editAccountModal = document.querySelector("edit-account-modal")
      editAccountModal.setAttribute("account", accountID)
    })
  })
}

// # Inactive account modal.
if (document.querySelector("#Inactive-Account-Modal")) {
  let modal = document.querySelector("#Inactive-Account-Modal")
  let modalOverlay = document.querySelector(
    "#Inactive-Account-Modal + .overlay"
  )
  // let modalSaveButton = modal.querySelector('.buttons .save-button');
  let inactiveAccountsCards = document.querySelectorAll(
    ".inactive-accounts-listing .account-row"
  )
  // let modalTabs = modal.querySelectorAll('.navigation > .tab');
  let savedAccount = ""

  // ~ Open/close functionality.
  // Open modal.
  modal.open = function () {
    this.classList.add("visible")
  }

  // Close modal.
  modal.close = function () {
    modal.classList.remove("visible")
  }

  // Modal setter(s).
  modal.setInfo = function (JSONresponse) {
    // Create variables for every updateable node.
    let daysAgo = modal.querySelector("small.expiration")
    let finalCause = modal.querySelector(".status .badge").innerHTML
    let accountID = modal.querySelector(".account-label b")
    let warrantyBegins = modal.querySelector("input[name=\"Warranty Begins\"]")
    let warrantyEnds = modal.querySelector("input[name=\"Warranty Ends\"]")
    let siteCode = modal.querySelector(".site-code")
    let nickname = modal.querySelector("input[name=\"Nickname\"]")
    let password = modal.querySelector("input[name=\"Password\"]")
    let pricePaid = modal.querySelector("span.price-paid")
    // let link = modal.querySelector('input[name="Link"]');
    let soldAccounts = modal.querySelector(".offers-number .remaining-offers")
    let availableAccounts = modal.querySelector(".offers-number .total-offers")
    let vendor = modal.querySelector("a.vendor-link")

    // Rewrite every input & extra nodes.
    accountID.innerHTML = JSONresponse["ACCOUNT_ID"]
    warrantyBegins.setAttribute("value", JSONresponse["WARRANTY_BEGINS"])
    warrantyEnds.setAttribute("value", JSONresponse["WARRANTY_ENDS"])
    nickname.setAttribute("value", JSONresponse["ACCOUNT_NICK"])
    password.setAttribute("value", JSONresponse["ACCOUNT_PASS"])
    // password.setAttribute('data-display', JSONresponse['ACCOUNT_PASS']);
    // link.setAttribute('value', JSONresponse['SITE_URL']);
    vendor.querySelector(".vendor__label").innerHTML =
      "@" + JSONresponse["VENDOR_ID"]
    vendor.querySelector(
      ".vendor__avatar"
    ).style = `background-image: url('../assets/vendors/${JSONresponse["VENDOR_ID"]}.png');`
    pricePaid.innerHTML = `$ ${JSONresponse["PRICE_PAID"]}<sup>.00</sup> MXN`
    soldAccounts.innerHTML = JSONresponse["N_SOLD"]
    availableAccounts.innerHTML = JSONresponse["N_AVAILABLE"]
    siteCode.innerHTML = JSONresponse["SITE_CODE"]
    daysAgo.innerHTML = `${finalCause} ${getDaysAgo(
      JSONresponse["ACTION_DATE"]
    )}`

    // Rewrite inputsvalue map collection.
    // inputsValues.set('Warranty Begins', JSONresponse['WARRANTY_BEGINS']);
    // inputsValues.set('Warranty Ends', JSONresponse['WARRANTY_ENDS']);
    // inputsValues.set('Nickname', JSONresponse['ACCOUNT_NICK']);
    // inputsValues.set('Password', JSONresponse['ACCOUNT_PASS']);
    // inputsValues.set('Link', JSONresponse['SITE_URL']);
    // inputsValues.set('Price Paid', `$${JSONresponse['PRICE_PAID']}.00 MXN`);
    // inputsValues.set('Accounts Sold', JSONresponse['N_SOLD']);
    // inputsValues.set('Accounts Available', JSONresponse['N_AVAILABLE']);
  }

  // Modal getters.
  modal.getKilledAccount = function (acc) {
    let request = new XMLHttpRequest()
    request.data = new FormData()

    request.data.append("__PULL", "1")
    request.data.append("__KILLED_ACCOUNT", "1")
    request.data.append("__ACCOUNT_ID", acc)

    return request
  }

  inactiveAccountsCards.forEach((card) => {
    let editButton = card.querySelector(".edit")
    let accountID = editButton.getAttribute("data-display")

    editButton.addEventListener("click", function () {
      // Disabled edit button momentary.
      this.setAttribute("disabled", "")

      if (savedAccount != accountID) {
        let request = modal.getKilledAccount(accountID)

        request.open("POST", "./hub.php")

        let promise = new Promise((resolve, reject) => {
          // Emulate server lag..
          setTimeout(function () {
            request.send(request.data)
          }, 1000)

          request.onreadystatechange = function () {
            // console.log(request);
            // console.log(`${request.readyState} & ${request.status}`);
            if (request.readyState == 4 && request.status == 200) {
              document
                .querySelector(`.edit[data-display="${accountID}"]`)
                .removeAttribute("disabled")
              savedAccount = JSON.parse(request.response)["ACCOUNT_ID"]
              resolve(JSON.parse(request.response))
            }
          }

          request.onerror = function () {
            reject("Failed Petition.. Err in Connection(.)")
          }
        })

        promise
          .then((resp) => {
            // console.log(resp);
            modal.setInfo(resp)
            modal.open()
          })
          .catch(() => {
            // console.error(error)
          })
      } else if (savedAccount == accountID) {
        modal.open()
        document
          .querySelector(`.edit[data-display="${accountID}"]`)
          .removeAttribute("disabled")
      }
    })
  })

  modalOverlay.addEventListener("click", function () {
    modal.close()
  })

  // Reactivate button handler(s).
  modal
    .querySelector("button.reactivate-button")
    .addEventListener("click", function () {
      let promise = new Promise((resolve, reject) => {
        let request = new XMLHttpRequest()
        let data = new FormData()
        data.append("__PUT", "1")
        data.append("__REVIVE_ACCOUNT", "1")
        data.append("__ACCOUNT_REVIVED", savedAccount)

        request.open("POST", "./hub.php")
        request.send(data)

        request.onreadystatechange = function () {
          if (request.status == 200 && request.readyState == 4)
            resolve(request.response)
        }

        request.onerror = function () {
          reject("Connection Error...")
        }
      })

      promise
        .then(() => {
          // console.log(response)
          modal.close()
        })
        .catch(() => {
          // console.error(response)
        })
    })
}

// vendors.php coding.
// List vendors while typing.
if (document.querySelector(".card-vendors-listing")) {
  let vendorsCollection = document.querySelectorAll(".vendor-row")

  document
    .querySelector("#Vendor-Input input")
    .addEventListener("keydown", function () {
      let input = this.value
      let regEx = new RegExp(`^.*(${input}).*$`, "i")

      let filteredCollection = []

      for (let vendorNode of vendorsCollection) {
        let vendor = vendorNode.querySelector("h2.vendor__name").innerHTML
        if (regEx.test(vendor)) filteredCollection.push(vendorNode)
      }

      document.querySelector("section.content").innerHTML = ""

      if (filteredCollection.length) {
        for (let filteredNode of filteredCollection) {
          let newNode = document.createElement("div")
          newNode.classList.add("vendor-row")
          newNode.setAttribute(
            "data-display",
            `@${filteredNode.getAttribute("data-display")}`
          )
          newNode.innerHTML = filteredNode.innerHTML
          document.querySelector("section.content").append(newNode)
        }
      } else {
        // Fill with original collection.
        for (let originalNode of vendorsCollection) {
          let newNode = document.createElement("div")
          newNode.classList.add("vendor-row")
          newNode.setAttribute(
            "data-display",
            `@${originalNode.getAttribute("data-display")}`
          )
          newNode.innerHTML = originalNode.innerHTML
          document.querySelector("section.content").append(newNode)
        }
      }
    })
}

// # NEW VENDOR MODAL.
if (document.querySelector("#New-Vendor-Modal")) {
  let modal = new Modal("New-Vendor-Modal")
  let addButton = document.querySelector("button.floating.add-vendor")
  let submitButton = modal.node.querySelector("button.submit")

  let avatarButton = modal.node.querySelector(".vendor__avatar")
  let avatarInput = modal.node.querySelector("form input[name=\"Avatar\"]")

  let vendorInput = modal.node.querySelector("input[name=\"ID\"]")
  let urlInput = modal.node.querySelector(".toolbar input[name=\"Link Input\"]")
  let vendorEmailInput = modal.node.querySelector("input[name=\"Email\"]")

  let avatarFile

  // + Validate modal.
  modal.validate = function () {
    let inputs = modal.node.querySelectorAll("input[type=\"text\"]")

    for (let input of inputs) {
      if (!input.value) return false
    }

    if (!avatarFile) return false

    return true
  }

  // + Submit modal's data.
  submitButton.addEventListener("click", function () {
    if (modal.validate()) {
      modal.add("__PUT", "1")
      modal.add("__VENDOR", "1")
      modal.add("__VENDOR_ID", vendorInput.value.replace("@", ""))
      modal.add("__VENDOR_EMAIL", vendorEmailInput.value)
      modal.add("__VENDOR_URL", urlInput.value)
      modal.add("__AVATAR", avatarFile)

      modal.upload()
    } else throw new Error("Invalid form!")
  })

  // Open modal.
  addButton.addEventListener("click", function () {
    modal.open()
  })

  // Open sys file dialog.
  avatarButton.addEventListener("click", function () {
    avatarInput.click()
  })

  // + Input validation.
  new validationFlag(vendorInput, "vendor/id")
  new validationFlag(urlInput, "vendor/url")
  new validationFlag(vendorEmailInput, "vendor/email")

  // + Avatar file handler.
  // + Avatar file validation.
  avatarInput.addEventListener("change", function () {
    let file = this.files[0]

    if (file.type == "image/png") {
      let reader = new FileReader()

      reader.readAsDataURL(file)

      reader.onload = function () {
        document.querySelector(".vendor__avatar img").src = reader.result
        document.querySelector(".vendor__avatar img").style.display = "block"
        document.querySelector(".vendor__avatar svg").style.display = "none"
      }

      reader.onloadend = function () {
        avatarFile = file
      }
    } else {
      throw new Error("Wrong file format submitted")
    }
  })

  // + Vendor field allowed keystrokes.
  vendorInput.addEventListener("keydown", function (e) {
    let regex = /[a-z0-9]|\d/i
    let value = this.value

    if (!regex.test(value) && e.ctrlKey) {
      e.preventDefault()
      return
    }
  })
}

// # reclaims.php.
if (document.querySelector("#Reclaim-Modal")) {
  let modal = new Modal("Reclaim-Modal")

  let reclaimsCollection = document.querySelectorAll(".reclaim-row")

  let resolveButton = modal.node.querySelector("button.resolve")
  let replaceButton = modal.node.querySelector("button.replace")

  modal.fill = function (obj) {
    let reclaim_id = this.node.querySelector("a#reclaim-id"),
      reclaim_date = this.node.querySelector("span#reclaim-date")
    let sale_id = this.node.querySelector("a#sale-id"),
      sale_email = this.node.querySelector("span#email")
    let account_id = this.node.querySelector("a#account-id"),
      account_nick = this.node.querySelector("span#account-nick"),
      account_status = obj["ACCOUNT_STATUS"],
      account_badge = this.node.querySelector("span.badge"),
      account_age = this.node.querySelector("small.detail")

    reclaim_id.innerHTML = obj["RECLAIM_ID"]
    reclaim_date.innerHTML = obj["DATE"]

    sale_id.innerHTML = obj["ORDER_ID"]
    sale_email.innerHTML = obj["USER_EMAIL"]

    account_id.innerHTML = obj["ACCOUNT_ID"]
    account_nick.innerHTML = obj["NICKNAME"]
    account_age.innerHTML = `ACCOUNT BOUGHT ${getDaysAgo(
      obj["ACCOUNT_BOUGHT_DATE"]
    )}`

    switch (account_status) {
      case "1":
        account_badge.innerHTML = "ACTIVE"
        account_badge.className = ""
        account_badge.classList.add("badge", "badge-active")
        break

      case "0":
        account_badge.innerHTML = "INNACTIVE"
        account_badge.className = ""
        account_badge.classList.add("badge", "badge-innactive")
        break

      case "KILLED":
        account_badge.innerHTML = "INNACTIVE"
        account_badge.className = ""
        account_badge.classList.add("badge", "badge-innactive")
        break
      // TO-DO: ADD MORE BADGES HANDLERS.

      default:
        break
    }

    if (obj["RECLAIM_STATUS"] == 1) {
      replaceButton.setAttribute("disable", "true")
      resolveButton.setAttribute("disabled", "true")
    } else if (obj["RECLAIM_STATUS"] == 0) {
      replaceButton.removeAttribute("disabled")
      resolveButton.removeAttribute("disabled")
    }

    // .innerHTML = obj[''];
  }

  modal.flush = function () {
    let reclaim_id = this.node.querySelector("a#reclaim-id"),
      reclaim_date = this.node.querySelector("span#reclaim-date")
    let sale_id = this.node.querySelector("a#sale-id"),
      sale_email = this.node.querySelector("span#email")
    let account_id = this.node.querySelector("a#account-id"),
      account_nick = this.node.querySelector("span#account-nick"),
      // account_status = obj['ACCOUNT_STATUS'],
      account_badge = this.node.querySelector("span.badge"),
      account_age = this.node.querySelector("small.detail")

    reclaim_id.innerHTML = "00000-00000"
    reclaim_date.innerHTML = "00/00/00"

    sale_id.innerHTML = "X00-00000"
    sale_email.innerHTML = "..."

    account_id.innerHTML = "00000-0000"
    account_nick.innerHTML = "..."
    account_age.innerHTML = "ACCOUNT BOUGHT 0 DAYS AGO"
    account_badge.className = ""
    account_badge.classList.add("badge")
    account_badge.innerHTML = "UNKNOWN"

    replaceButton.setAttribute("disabled", "disabled")
    resolveButton.setAttribute("disabled", "disabled")
  }

  modal.overlay.addEventListener("click", function () {
    modal.flush()
  })

  // Set opener of modal.
  reclaimsCollection.forEach((node) => {
    node.addEventListener("dblclick", function () {
      globalThis.rowTarget = this
      let reclaimID = this.getAttribute("data-display") || false

      if (reclaimID) {
        modal.open()
        let promise = new Promise((resolve) => {
          const URL = `../v1/reclaims/${reclaimID}`
          let body = {
            method: "GET",
          }

          fetch(URL, body).then((res) => {
            if (res.ok) resolve(res.json())
          })
        })

        promise.then((data) => {
          modal.fill(data)
          replaceButton.setAttribute("data-display", data["ACCOUNT_ID"])
        })
      }
    })
  })

  // Close modal when button is activated.
  replaceButton.addEventListener("click", function () {
    modal.close()
    modal.flush()
  })

  // Close modal when button is activated.
  resolveButton.addEventListener("click", function () {
    const URL = "../v1/reclaims/resolve"
    let reclaimID = modal.node.querySelector("a#reclaim-id").innerHTML
    let data = {
      __RECLAIM_ID: reclaimID,
    }
    const body = {
      method: "PATCH",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    }

    fetch(URL, body)
      .then((res) => {
        if (res.ok) {
          globalThis.rowTarget.classList.remove("not-solved")
          globalThis.rowTarget.classList.add("solved")
        }
      })
      .finally(() => {
        modal.close()
        modal.flush()
      })
  })
}

// Reclaims replace account modal functionality.
if (document.querySelector("#Replace-Account-Modal")) {
  let modal = new Modal("Replace-Account-Modal")

  let accountID = undefined

  let reclaimID = document.querySelector("a#reclaim-id").innerHTML

  let replaceAccountButton = document.querySelector("button.replace")

  let submitButton = modal.node.querySelector("button.submit")

  let nicknameInput = modal.node.querySelector("input[name=\"RPLCM Nick\"]")
  let passwordInput = modal.node.querySelector("input[name=\"RPLCM Pass\"]")

  // Open replacement modal.
  replaceAccountButton.addEventListener("click", function () {
    let data = this.getAttribute("data-display") ?? false

    if (data) {
      modal.open()
      accountID = data
    }
  })

  nicknameInput.addEventListener("keydown", function (e) {
    let regex = /[A-Za-z0-9]|Backspace|Tab|\.|_|-/i

    if (!regex.test(e.key)) {
      e.preventDefault()
    }
  })

  passwordInput.addEventListener("keydown", function (e) {
    let regex = /[A-Za-z0-9]|Backspace|Tab|\.|_|-/i

    if (!regex.test(e.key)) {
      e.preventDefault()
    }
  })

  submitButton.addEventListener("click", function () {
    let regex = /([A-Za-z0-9]|\.|-|_){4,}/

    if (regex.test(passwordInput.value) && regex.test(nicknameInput.value)) {
      modal.close()
      let request = new XMLHttpRequest()
      let data = new FormData()

      data.append("__PUT", "1")
      data.append("__REPLACE_ACCOUNT", "1")
      data.append("__ACCOUNT_ID", accountID)
      data.append("__NICKNAME", nicknameInput.value)
      data.append("__PASS", passwordInput.value)

      request.open("POST", "./hub.php")
      setTimeout(() => {
        request.send(data)
      }, 1500)

      request.onreadystatechange = function () {
        if (this.status == 200 && this.readyState == 4) {
          if (/@@/.test(this.responseText)) {
            let request = new XMLHttpRequest()
            let data = new FormData()

            data.append("__UPDATE", "1")
            data.append("__RECLAIM", "1")
            data.append("__ID", reclaimID)
            // data.append('__NICKNAME', nicknameInput.value);
            // data.append('__PASS', passwordInput.value);

            request.open("POST", "./hub.php")
            setTimeout(() => {
              request.send(data)
            }, 1500)

            request.onreadystatechange = function () {
              if (this.readyState == 4 && this.status == 200) {
                globalThis.rowTarget.classList.remove("not-solved")
                globalThis.rowTarget.classList.add("solved")

                let request = new XMLHttpRequest()
                let data = new FormData()

                data.append("__UPDATE", "1")
                data.append("__SOLVE_RECLAIM", "1")
                data.append(
                  "__ID",
                  globalThis.rowTarget.getAttribute("data-display")
                )

                request.open("POST", "./hub.php")
                request.send(data)
              }
            }
          }
        }
      }
    }
  })
}

// Messages page coding.
if (document.querySelector(".card-messages-listing")) {
  let messagesCollection = {}
  let linksContainer = document.querySelector("ul.pagination")
  let category = "ALL" // Initial category.

  let content = document.querySelector("section.content")

  messagesCollection[1] = []

  // Get initial messages collection.
  document.querySelectorAll("div.message-row").forEach((node) => {
    messagesCollection[1].push(node)
  })

  // + Add event handler for links container.
  linksContainer.addEventListener("click", async function (e) {
    e.preventDefault()

    if (e.target.tagName === "A") {
      let page = e.target.innerHTML
      const URL = `../v1/messages?page=${page}&category=${category}`

      if (page in messagesCollection) {
        document.querySelector("section.content").innerHTML = ""
        document
          .querySelector("ul.pagination li.link--active ")
          .classList.remove("link--active")
        e.target.parentElement.classList.add("link--active")

        for (let message of messagesCollection[page]) {
          document.querySelector("section.content").append(message)
        }

        return
      }

      let messages = await fetch(URL)
        .then((res) => {
          document.querySelector("ul.pagination").classList.add("loading")
          if (res.ok) return res.json()
          else return false
        })
        .finally(() => {
          document.querySelector("ul.pagination").classList.remove("loading")
        })

      if (!messages) return

      messagesCollection[page] = []

      document
        .querySelector("ul.pagination li.link--active")
        .classList.remove("link--active")
      e.target.parentElement.classList.add("link--active")

      document.querySelector("section.content").innerHTML = ""

      for (let message of messages) {
        let node = Factory.createMessageRow(message)
        Factory.setMessageRow(node)
        document.querySelector("section.content").appendChild(node)
        messagesCollection[page].push(node)
      }
    }
  })

  // links.forEach( link => {
  //     link.addEventListener('click', function(e)
  //     {
  //         let page = this.innerHTML;

  //         if ( !( page in messagesCollection )  )
  //         {
  //             let request = Request({ '__PULL': '1',
  //                                     '__MESSAGES_PAGE': page,
  //                                     '__CATEGORY': category });

  //             request.onreadystatechange = function(ev) {
  //                 if ( this.readyState == 4 && this.status == 200 )
  //                 {
  //                     setTimeout( function() {

  //                         messagesCollection[page] = [];
  //                         let res = JSON.parse(request.response);

  //                         document.querySelector('ul.pagination').classList.remove('loading');
  //                         document.querySelector('ul.pagination li.link--active ').classList.remove('link--active');
  //                         e.target.parentElement.classList.add('link--active');
  //                         document.querySelector('section.content').innerHTML = '';

  //                         for(let message of res) {
  //                             let node = Factory.createMessageRow(message);
  //                             Factory.setMessageRow(node);
  //                             document.querySelector('section.content').appendChild(node);
  //                             messagesCollection[page].push(node);
  //                         }

  //                     }, 2500);
  //                 }
  //             }

  //             request.onload = function(e) {
  //                 actualPage = page;
  //                 document.querySelector('ul.pagination').classList.add('loading');
  //             }

  //         }

  //         else if ( page in messagesCollection ) {
  //             document.querySelector('section.content').innerHTML = '';
  //             document.querySelector('ul.pagination li.link--active ').classList.remove('link--active');
  //             e.target.parentElement.classList.add('link--active');

  //             for ( let message of messagesCollection[page]  ) {
  //                 document.querySelector('section.content').append(message);
  //             }
  //         }

  //     });
  // });

  // Category selection handlers.
  document
    .querySelector(".toolbar.selection")
    .addEventListener("click", function (e) {
      if (e.target.tagName !== "LI") return // Target ONLY list items.

      let cat = this.getAttribute("data-display")

      if (category !== cat) {
        category = cat
        messagesCollection = {}

        Request({
          __PULL: "1",
          __TOTAL_MESSAGES: "1",
          __CATEGORY: category,
        }).onreadystatechange = function () {
          if (this.readyState == 4 && this.status == 200) {
            let messages = JSON.parse(this.response)
            content.innerHTML = ""

            Pagination.rewrite(
              document.querySelector("ul.pagination"),
              messages["TOTAL"],
              Pagination.MESSAGES_PER_PAGE
            )

            for (let index in messages) {
              if (Number.isNaN(Number.parseInt(messages[index]))) {
                let node = Factory.createMessageRow(messages[index])
                Factory.setMessageRow(node)
                content.appendChild(node)
                // console.log(messages[index]);
              }
            }
          }
        }
      } else if (category != cat && category == "ALL") {
        category = cat
        messagesCollection = {}

        Request({
          __PULL: "1",
          __TOTAL_MESSAGES: "1",
          __CATEGORY: "",
        }).onreadystatechange = function () {
          if (this.readyState == 4 && this.status == 200) {
            let messages = JSON.parse(this.response)
            Pagination.rewrite(
              document.querySelector("ul.pagination"),
              messages["TOTAL"],
              Pagination.MESSAGES_PER_PAGE
            )
          }
        }
      }
    })

  // let pagination = {
  //     node: null,
  //     'postsPerPage': undefined,
  //     'totalPages': undefined,
  //     'page': 1,
  //     'max': 5,

  //     setTotalPages(cat = undefined) {
  //         // let request = new XMLHttpRequest();
  //         Request({
  //             '__PULL': '1',
  //             '__TOTAL_MESSAGES': '1',
  //             '__CATEGORY': cat,
  //         })
  //         .onreadystatechange = function(e)
  //         {
  //             if ( this.readyState == 4 && this.status == 200 ) {
  //                 // totalPages = Math.round( Number.parseInt(this.responseText) / postsPerPage );
  //                 console.log(this.response)
  //             }
  //         };

  //     },

  //     goTo(page) {
  //         if ( page <= this.totalPages ) {
  //             this.rewrite(page)
  //         }
  //     },

  //     rewrite(page) {
  //         if ( page > 1 ){}

  //     }
  // };

  // Get initial messages collection.
  // document.querySelectorAll('div.message-row').forEach( (node , index) => {
  //     originalMessagesCollection[index + 1] = node;
  // });
}
