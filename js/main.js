import { getDaysLeft, getDaysAgo } from './date.js';
import { setEarsForSelection, setEarsForVendorSelection, fillSelectionOptions } from './ears.js';
import { validationCollection } from "./classes/validationCollection.js";
import { checkVendors } from './vendors.js';
import { collectionToList, listingASC, listingDESC,  } from './arrange.js';
import { accountItem, filterCollection } from './accountItem.js';
import { getOrigin } from './classes/draggableImage.js';
// import { zoomableImage } from './classes/zoomableImage.js';
import { validationFlag } from './classes/validationFlag.js';
import { Modal } from './classes/modal.js';
import { Picture } from './classes/picture.js';
import { Factory } from './factory.js';
import { Pagination } from './pagination.js';
// import { nodeItem } from "./classes/nodeItem.js";

// @ General use functions.
// cleanPriceInput()
// Request()

function cleanPriceInput(str) {
    let start = str.indexOf('$');
    let end = str.indexOf('.');
    return str.substring(start + 1, end);
}

function Request(data) {
    if (typeof data != 'object')
        return false;

    let request = new XMLHttpRequest();
    let d = new FormData();

    for (let key in data) 
        d.append(key, data[key]);

    request.open('POST', 'hub.php');
    request.send(d);

    return request;
}


// Header open/close menu.
let header_menu = document.getElementById('header_menu');

header_menu.addEventListener('click', function() {
    this.classList.toggle('menu--active');
});


// Set click handler for .toolbar.selection elements.
if ( document.querySelector('.toolbar.selection') ) {
    setEarsForSelection();
}
// Set handler(s) for .toolbar.vendor-input element.
if ( document.querySelector('.toolbar.vendor-input') ) {
    setEarsForVendorSelection();
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
if ( document.querySelector('article.websites-listing') ) {
    let originalWebsitesCollection = document.querySelectorAll('div.website-row');
    let wrapper = document.querySelector('section.content');
    document.querySelector('.toolbar.searchbox input').addEventListener('keyup', function(e) {
        let input = this.value;
        let filteredCollection = [];

        for (let element of originalWebsitesCollection) {
            let title = element.querySelector('h4.title').innerHTML;
            let reg = new RegExp(`^.*(${input}).*$`, 'i');

            if ( reg.test(title) )
                filteredCollection.push(element);
        }
        // console.log(filteredCollection)

        if ( filteredCollection.length ) {
            wrapper.innerHTML = '';
            for(let filteredElement of filteredCollection)
                wrapper.append(filteredElement);

        } 
        
        else {
            // for(let originalElement of originalWebsitesCollection) {
            //     wrapper.append(originalElement);
            // }
        }
        
    });
}


// # website.php (single).
// # Will only run when the link variable "website" contains a valid site code.
if ( document.querySelector('.screens-wrap') ) {

    let screens_wrap = document.querySelector('.screens-wrap');
    let screens_strip = document.querySelector('.screens-strip');

    // Screen strip slidding handler code.
    screens_wrap.addEventListener('mousedown', function(e) 
    {
        let cursorX = e.pageX;
        let position_left = (this.style.left) ? Number.parseInt(this.style.left) : '0';
        let total_path = screens_strip.offsetWidth - screens_wrap.offsetWidth + 255;

        document.onmousemove = (e) => 
        {
            let new_position_left = (position_left + ( -(cursorX - e.pageX)) );

            if ( new_position_left <= 0 && -(new_position_left) <= total_path ) 
                this.style.left =  new_position_left + 'px';
            
            else if ( new_position_left == 0 ) 
                window // Do nothing.

            else if ( new_position_left > 0 ) 
                this.style.left = '0px';
            
        }
        
    });
    
    document.addEventListener('mouseup', function() {
        document.onmousemove = function() {}
    })
}




// # `website.php` (landing || single)
if ( document.querySelector('new-subsite-modal') ) {
    const goBackButton = document.querySelector(".header button.go-back");
    const newLogoButton = document.querySelector("button[name='New Logo']");
    const fileInputNode = document.querySelector("input[name='New Logo']")

    goBackButton.addEventListener('click', () => {
        let url = window.location.toString();
        let questionMark = url.lastIndexOf('?');
        window.location = url.substring(0, questionMark);
    });

    newLogoButton?.addEventListener("click", () => fileInputNode.click());

    fileInputNode?.addEventListener("change", function() {

        let file = this.files[0],
            site = document.querySelector("h2.site-code").innerHTML,
            logoImage = document.querySelector('figure.site-logo img'),
            data = new FormData(),
            url = "./hub.php"

        const body = {
            method: "POST",
            body: data
        }
        const image = new Image();
        
        data.append("__PUT", "1");
        data.append("__WEBSITE_LOGO", "1");
        data.append("__SITE_CODE", site);
        data.append("__NEW_LOGO", file);

        image.onload = function() {
            const aspectRatio = image.height / image.width;

            if (aspectRatio > .7 && aspectRatio <= 1) {
                fetch(url, body)
            } else {
                // console.error('Image has an invalid aspect ratio');
            }
        }

        if ( file.type == "image/png" && file.size <= 300000 ) {

            let reader = new FileReader();
            reader.readAsDataURL(file);

            reader.onload = function() {
                image.src = reader.result;
                logoImage.src = reader.result;
            }
        } else {
            // console.error('Invalid file format.');
        }
        });
}






// Pagination for website screens.
if ( document.querySelector('.screens-wrap')
     && document.querySelector('.toolbar.pagination')?.childElementCount) 
{
    // Pagination function constructor.
    let Pagination = function() {};

    Pagination.prototype.max = 8;
    Pagination.prototype.getRows = function(numPage = 0) 
    {
        console.log(this.records);
        let records = [];
        for ( let i = 0; i < this.max; i++ ) 
        {
            let actualIndex = ((numPage - 1) * this.max) + i;
            if ( this.records[actualIndex] ) 
                records.push(this.records[actualIndex]);
        
            else 
                break;
        }
        console.log(records)
        return records;
    }

    Pagination.prototype.setRecords = function(records) {
        this.records = records;
    }


    let site = document.querySelector('h2.site-code').innerHTML;
    let pagination = new Pagination();

    pagination.rewrite = function(recordCollection) {
        let strip = document.querySelector('.screens-strip');
        strip.innerHTML = "";

        let squeleton = '';
        for(let record of recordCollection ) {
            squeleton += `
                                <div class="screen" style="background-image: url('../assets/screens/${site}/${record}.jpg')">
                                    <img src="../assets/subsites_logos/${site}/${record}.png" alt="${record}logo" class="subsite-logo" draggable="false">
                                    <p class="title">${record}</p>
                                </div>
                            `;
        }
        strip.innerHTML = squeleton;
        document.querySelector('.screens-wrap').style.left = '0px';

    };

    let screens = new Promise( (resolve, reject) => {
        let request = new XMLHttpRequest();
        let data = new FormData();
        data.append('__PULL', '1');
        data.append('__SCREENS', '1');
        data.append('__SITE_CODE', site);

        request.open('POST', './hub.php');
        request.send(data);

        request.onreadystatechange = function(e) {
            if ( this.readyState == 4 ) 
                resolve(JSON.parse(request.responseText));
        };

        request.onerror = function(e) {
            reject('Error with Server.');
        };
    });

    screens.then( (response) => {
        if ( response )
            pagination.setRecords(response);
        else
            console.log(response);
    }).catch( (message) => {
        console.error(message);
    });


    // Set listener for pagination links.
    let paginationLinks = document.querySelectorAll('.toolbar.pagination a');

    paginationLinks.forEach( (node) => {
        node.addEventListener('click', function(e) {
            e.preventDefault();

            let page = e.target.innerHTML;
            let nodeActive = document.querySelector('.toolbar.pagination .link--active');

            nodeActive.classList.remove('link--active');
            e.target.parentElement.classList.add('link--active');
            pagination.rewrite( pagination.getRows(page) );
        });
    });

}




// # accounts.php (landing).
// # fill .toolbar.selection element with websites listing.
if ( document.querySelector('#Site-Selection') ) {
    fillSelectionOptions( document.querySelector('.modal #Site-Selection'), '__WEBSITES' );
}

// # accounts.php (landing).
// Only executes within accounts.php.
if ( document.querySelector('article.card-websites-accounts-listing')  ) {

    let websitesCollection = document.querySelectorAll('.website-accounts-row');
    let list = collectionToList(websitesCollection);
    // console.log(list);

    document.querySelector('.toolbar.selection').addEventListener('click', function(e) {

        let data = this.getAttribute('data-display');

        if ( data == 'ASC' ) {

            // let ascendingList = listingASC(list);
            listingASC(list);
            document.querySelector('article section.content').innerHTML = '' // Flush content.
            // Append children to container.
            for ( let i = 0; i < list.length; i++ )
                document.querySelector('article section.content').appendChild(list[i].node);
        }

        else if ( data == 'DESC' ) {

            // let ascendingList = listingDESC(list);
            listingDESC(list);
            document.querySelector('article section.content').innerHTML = '' // Flush content.
            // Append children to container.
            for ( let i = 0; i < list.length; i++ )
                document.querySelector('article section.content').appendChild(list[i].node);
        }

    });
}

// # accounts.php (single).
// # Only executes within "accounts.php?website=".
if ( document.querySelector('#Accounts-Card') ) {
    
    let accountsCards = document.querySelectorAll('.active-accounts-listing .account-row');
    let inactiveAccountsCards = document.querySelectorAll('.inactive-accounts-listing .account-row');
    let closeButton = document.querySelector('.close-button');

    closeButton.onclick = function() {
        let url = window.location.toString();
        let questionMark = url.lastIndexOf('?');
        window.location = url.substring(0, questionMark);
        // console.warn(url); 
    }

    let inactiveAccountsCollection = {};
    inactiveAccountsCollection.length = 0;

    inactiveAccountsCards.forEach( (card, index) => {
        inactiveAccountsCollection[index] = new accountItem(card);
        inactiveAccountsCollection.length++;
    });

    let activeAccountsCollection = {};
    activeAccountsCollection.length = 0;

    accountsCards.forEach( (card, index) => {
        activeAccountsCollection[index] = new accountItem(card);
        activeAccountsCollection.length++;
    });

    // console.log(inactiveAccountsCollection);
        
    let targets = document.querySelectorAll('.navigation > p');
    let activeAccountsTab = targets[0];
    let inactiveAccountsTab = targets[1];

    let vendorInput = document.querySelector('.toolbar.text-input input');

    // # accounts.php (single).
    // # Vendor text input handler(s).
    // + Avoid input of special characters.
    vendorInput.addEventListener('keydown', function(e) {
        let regEx = /\b/;
        if ( regEx.test(e.key) ) {
            // console.log(e.key);
        }
        else {
            e.preventDefault();
        }
    });

    // # accounts.php (single).
    // # Vendor input typing handler.
    // + Update view by adding those cards whose vendor label math the query.
    vendorInput.addEventListener('keyup', function(e) {

        let input = this.value;
        let activeAccountsWrapper = document.querySelector('.content .active-accounts-listing');
        let inactiveAccountsWrapper = document.querySelector('.content .inactive-accounts-listing');
        // console.log(this.value);
        activeAccountsWrapper.innerHTML = '';
        inactiveAccountsWrapper.innerHTML = '';
        let activeAccountsFiltered = filterCollection(activeAccountsCollection, input);
        let inactiveAccountsFiltered = filterCollection(inactiveAccountsCollection, input);
        // console.log(filteredCollection);

        // Append all filtered active cards.
        for( let i = 0; i < activeAccountsFiltered.length; i++ )
            activeAccountsWrapper.appendChild(activeAccountsFiltered[i].node);
            
        // Append all filtered inactive cards.
        for( let i = 0; i < inactiveAccountsFiltered.length; i++ )
            inactiveAccountsWrapper.appendChild(inactiveAccountsFiltered[i].node);

    });

    // # accounts.php (single).
    // # Active tab node.
    // + Activate active accounts tab.
    activeAccountsTab.addEventListener('click', function(e) {

        if ( !this.classList.contains('active') ) {
            this.classList.add('active');
            inactiveAccountsTab.classList.remove('active');
            document.querySelector('section.content').classList.toggle('active-accounts');
            document.querySelector('section.content').classList.toggle('inactive-accounts');
        }
    });

    // # accounts.php (single).
    // # Inactive tab node.
    // + Activate inactive accounts tab.
    inactiveAccountsTab.addEventListener('click', function(e) {

        if ( !this.classList.contains('active') ) {
            this.classList.add('active');
            activeAccountsTab.classList.remove('active');
            document.querySelector('section.content').classList.toggle('active-accounts');
            document.querySelector('section.content').classList.toggle('inactive-accounts');
        }
    });

    // # accounts.php (single).
    // # Collection of active accounts cards.
    // + Rewrite the date of each account card.
    for(const account of accountsCards ) 
    {
        let dateString = account.querySelector('.expiration-date').innerHTML;
        let daysLeft = getDaysLeft(dateString);
        account.querySelector('.expiration-date').innerHTML = daysLeft;
    }
}

// # MODAL (NEW ACCOUNT).
if ( document.querySelector('#New-Account') && document.querySelector('#New-Account-Modal') ) 
{
    // Important modal references.
    let modal = document.querySelector('#New-Account-Modal');
    let modalOverlay = document.querySelector('#New-Account-Modal + .overlay');
    let modalButton = document.querySelector('#New-Account');
    let modalNext = modal.querySelector('.next-button');
    let modalPrevious = modal.querySelector('.previous-button');
    let modalControls = modal.querySelectorAll('.selector-phase > .phase');

    modal.phases = modal.querySelectorAll('.phases > div');
    modal.actualPhase = 0;
    modal.inputIndex = 0;
    // console.log(modal.phases)
    // console.log(modal);


    // Declare form elements.
    let form = {};
    form.elements = document.querySelectorAll('input[name^=A__]');
    form.isValid = false;
    // console.log(form.elements);

    // Validation of each form element.
    form.flags = [];
    form.flags[0] = []; // Define first phase validation expressions.
    form.flags[0][0] = /\w/; // Website regex validation expression.
    modal.phases[0].controls = [];
    modal.phases[0].controls[0] = form.elements[0];

    form.flags[1] = []; // Define second phase validation expressions.
    form.flags[1][0] = /^\w{3,}$/i; // Nickname regex validation expression.
    form.flags[1][1] = /^[\.$@_a-zA-Z0-9]{3,}$/i; // Pass regex validation expression.
    modal.phases[1].controls = [];
    modal.phases[1].controls[0] = form.elements[1];
    modal.phases[1].controls[1] = form.elements[2];

    form.flags[2] = []; // Define third phase validation expressions.
    form.flags[2][0] = /^[1-9]+[0-9]+$/; // Price number regex validation expression.
    modal.phases[2].controls = [];
    modal.phases[2].controls[0] = form.elements[3];

    form.flags[3] = []; // Define fourth phase validation expressions.
    form.flags[3][0] = /^\d{1,}$/; // Offers number regex validation expression.
    modal.phases[3].controls = [];
    modal.phases[3].controls[0] = form.elements[4];

    form.flags[4] = []; // Define fifth phase validation expressions.
    form.flags[4][0] = /[a-zA-Z0-9]{3,}/; // Vendor input regex validation expression.
    modal.phases[4].controls = [];
    modal.phases[4].controls[0] = form.elements[5];

    form.flags[5] = []; // Define sixth phase validation expressions.
    form.flags[5][0] = /\d{4}-\d{2}-\d{2}/; // Warranty begins input regex validation expression.
    form.flags[5][1] = /\d{4}-\d{2}-\d{2}/; // Warranty begins input regex validation expression.
    modal.phases[5].controls = [];
    modal.phases[5].controls[0] = form.elements[6];
    modal.phases[5].controls[1] = form.elements[7];

    // Set modal methods.
    modal.next = function() {
        modalControls[modal.actualPhase].classList.remove('focus');
        modal.phases[modal.actualPhase].classList.add('had-focus');
        modal.actualPhase++;
        modal.inputIndex++;
        modal.phases[modal.actualPhase].classList.add('focused');
        modalControls[modal.actualPhase].classList.add('focus');
        // console.log(`Actual Phase #${modal.actualPhase + 1}`);            
    }

    modal.prev = function() {
        if ( modal.actualPhase == 1 ) {
            modalPrevious.setAttribute('disabled', '');
        }
        modalControls[modal.actualPhase].classList.remove('focus');
        modal.phases[modal.actualPhase].classList.remove('focused');
        modal.phases[modal.actualPhase].classList.remove('had-focus');
        modal.actualPhase--;
        modal.phases[modal.actualPhase].classList.remove('had-focus');
        modal.phases[modal.actualPhase].classList.add('focused');
        modalControls[modal.actualPhase].classList.add('focus');
        // console.log(`Actual Phase #${modal.actualPhase + 1}`);
    }

    modal.validatePhase = () => {
        // if ( !modal.phases[modal.actualPhase].isValid ) {
            // console.warn(form.flags[modal.actualPhase]);
            // let phaseFlags = form.flags[modal.actualPhase];
            // let index = modal.actualPhase;
            let i = 0;
    
            for(const formNode of modal.phases[modal.actualPhase].controls) {

                // let data = form.elements[index].value;
                let data = formNode.value;
                let reg = form.flags[modal.actualPhase][i];

                // console.log(`Data Received: '${data}' w/ the RegEx: '${reg}' `);

                if ( !reg.test(data) ) {
                    // console.warn(reg.test(data));
                    modalControls[modal.actualPhase].classList.remove('valid');
                    return false;
                }

                // index++;
                i++;
            }

            modalControls[modal.actualPhase].classList.add('valid');
            // console.log(`Phase Is Valid! Hurray!`);
    }

    modal.validateForm = function() {
        let website = form.elements[0].getAttribute('value');
        let nickname = form.elements[1].getAttribute('value');
        let password = form.elements[2].getAttribute('value');
        let pricePaid = form.elements[3].getAttribute('value');
        let offers = form.elements[4].getAttribute('value');
        let vendor = form.elements[5].getAttribute('value');
        let warrantyBegins = form.elements[6].getAttribute('value');
        let warrantyEnds = form.elements[7].getAttribute('value');

        if ( website && nickname && password && pricePaid &&
                offers && vendor && warrantyBegins && warrantyEnds ) {

            let form = new FormData();
            form.append('__FUN', 'New Account');
            form.append('__WEBSITE', website);
            form.append('__NICK', nickname);
            form.append('__PASS', password);
            form.append('__PRICE', pricePaid);
            form.append('__OFFERS', offers);
            form.append('__VENDOR', vendor);
            form.append('__WBEGINS', warrantyBegins);
            form.append('__WENDS', warrantyEnds);

            let request = new XMLHttpRequest();
            request.open('POST', './hub.php');
            request.send(form);

            request.onreadystatechange = function(e) {
                if (request.readyState == 4 && request.status == 200) {

                    modal.classList.remove('visible');      
                    console.log(this.responseText);
                    // document.appendChild(this.response);
                    // Hide & remove.
                    // setTimeout(function() {
                    //     let toast = document.querySelector('.toast');

                    //     toast.addEventListener('animationend', function(e) {
                    //         this.parentNode.removeChild(toast);
                    //     });

                    //     toast.style.animation = 'hide_pop_up 250ms ease-out';

                    // }, 7500)

                }
            }
            
            
            // return true;
        }

        // console.warn('Something is still missing chief!');
    }

    

    // # MODAL (NEW ACCOUNT).
    // + Event listeners for form inputs elements.
    // # Website selector picker event.
    document.getElementById('Site-Selection').addEventListener('click', function(e) {
        let data = this.getAttribute('data-display');
        // console.warn(data)
        form.elements[0].setAttribute('value', data);
    });

    // # MODAL (NEW ACCOUNT).
    // # Nickname field typing event.
    document.querySelector('.second > input[placeholder="NICKNAME"]').addEventListener('keyup', function(e) {

        let data = this.value;

        if ( form.elements[1].getAttribute('value') != data ) {
            form.elements[1].setAttribute('value', data);
        }
        
        // console.log(form.elements[1].getAttribute('value'));

    });

    // # MODAL (NEW ACCOUNT).
    // Password field typing event.
    document.querySelector('.second > input[placeholder="PASSWORD"]').addEventListener('keyup', function(e) {
        let data = this.value;
        
        form.elements[2].setAttribute('value', data);
    });

    // # MODAL (NEW ACCOUNT).
    // # Price input element events handler.
    document.querySelector('.third input[name="Price Input"]').addEventListener('keydown', function(e) {

            e.preventDefault();

            let regEx = /(\d|Backspace)/;
            let formNode = form.elements[3];
            let formNodeData = formNode.getAttribute('value');

            console.log(formNodeData);
            
            // If the user doesn't digit either a digit or backspace key.
            if( regEx.test(e.key) ) {

                // If the key Backspace is pressed.
                if ( e.key == 'Backspace' ) {

                    if ( formNodeData ) {

                        let newData = formNodeData.substring(0, formNodeData.length - 1);
                        let data = `$${newData}.00 MXN`;
                        this.setAttribute('value', data);
                        formNode.setAttribute('value', newData);
                    }

                    else
                        this.setAttribute('value', '');
                }
                
                // If a digit is entered.
                else {

                    // If formNode isn't empty.
                    if ( formNode.getAttribute('value') ) {

                        let data = `$${formNodeData.concat(e.key)}.00 MXN`;
                        this.setAttribute('value', data);
                        formNode.setAttribute('value', formNodeData.concat(e.key) );
                        // console.log(`Write N' Concat`);
                    }

                    // If formNode is empty.
                    else {

                        let data = `$${e.key}.00 MXN`;
                        this.setAttribute('value', data);
                        formNode.setAttribute('value', e.key);
                         console.log(`Write new`);
                    }
                }
            }
        });

    // # MODAL (NEW ACCOUNT).
    // # Plus button click event.
    document.querySelector('.fourth button[name="add"]').addEventListener('click', function(e) {

        let counterNode = document.querySelector('.fourth span.counter');
        let actualCounter = Number.parseInt(counterNode.innerHTML);

        if ( actualCounter == 1 )
            document.querySelector('.fourth button[name="minus"]').removeAttribute('disabled');

        actualCounter++;
        counterNode.innerHTML = actualCounter;
        form.elements[4].setAttribute('value', actualCounter);
    });

    // # MODAL (NEW ACCOUNT).
    // # Minus button click event.
    document.querySelector('.fourth button[name="minus"]').addEventListener('click', function(e) {

        let counterNode = document.querySelector('.fourth span.counter');
        let actualCounter = Number.parseInt(document.querySelector('.fourth span.counter').innerHTML);

        if ( (actualCounter - 1) <= 1 ) {
            document.querySelector('.fourth button[name="minus"]').setAttribute('disabled', 'true');
        }
        
        if ( (actualCounter - 1) > 0 ) { 
            actualCounter--;
            counterNode.innerHTML = actualCounter;
            form.elements[4].setAttribute('value', actualCounter);
        }

    });

    // # MODAL (NEW ACCOUNT).
    // # Vendor selection event handlers.
    // + Click handler.
    document.querySelector('.fifth .toolbar').addEventListener('click', function(e) {
        let vendor = this.getAttribute('data-display');
        vendor = vendor.substring(1);
        form.elements[5].setAttribute('value', vendor);
    });

    // # MODAL (NEW ACCOUNT).
    // # Vendor selection event handlers.
    // + Check vendors list.
    // + Update recommendation list.
    document.querySelector('.fifth .toolbar input').addEventListener('keyup', function(e) {
        let data = this.value;
        checkVendors(document.querySelector('.vendor-input'), data);
    });

    // # MODAL (NEW ACCOUNT).
    // # Warranty begins typing event.
    // + Avoid typing of unwanted keys.
    // + Update field's logical value.
    document.querySelector('.sixth input[name="Warranty Begins"]').addEventListener('keydown', function(e) {
        
        let reg = /[0-9]|-|Backspace|Tab/; // Only accepts the previous keys.
        let data = form.elements[6].getAttribute('value');

        if ( !reg.test(e.key) ) 
            e.preventDefault();
        
        else {

            if ( e.key != 'Backspace' && e.key != 'Tab' ) {

                if ( data )
                    form.elements[6].setAttribute('value', data.concat(e.key));

                else 
                    form.elements[6].setAttribute('value', e.key);
            }

            else if ( e.key == 'Backspace' ) {

                data = data.substring(0, data.length - 1);
                form.elements[6].setAttribute('value', data);
            }
        }
        
        // console.log(`Warranty Began value: ${form.elements[6].getAttribute('value')}`);
        
    });

    // # MODAL (NEW ACCOUNT).
    // # Warranty begins focusout event handler.
    // + Add 20-odd days to any given date.
    // + Update field's logical & visible value.
    document.querySelector('.sixth input[name="Warranty Begins"]').addEventListener('focusout', function(e) {
        
        let data = form.elements[6].getAttribute('value');
        let warrantyBegan = new Date(data);
        // let month = 2.419e+9;

        if ( Date.parse(warrantyBegan) ) {

            let warrantyEnds = new Date();
            warrantyEnds.setTime( warrantyBegan.valueOf() + (86400000 * 28) );
            // console.log(warrantyEnds.getDate());

            warrantyEnds.year = warrantyEnds.getFullYear();
            warrantyEnds.month = ( warrantyEnds.getMonth().toString().length == 1 ) ? `0${warrantyEnds.getMonth() + 1}` : warrantyEnds.getMonth() + 1;
            warrantyEnds.day = ( warrantyEnds.getDate() >= 10 ) ? warrantyEnds.getDate() : `0${warrantyEnds.getDate()}`;
            let newDateString = warrantyEnds.year + '-' + warrantyEnds.month + '-' + warrantyEnds.day;

            document.querySelector('.sixth input[name="Warranty Ends"]').setAttribute('value', newDateString);
            document.querySelector('.sixth input[name="Warranty Ends"]').value = newDateString;
            form.elements[7].setAttribute('value', newDateString);
        }

        // Remove input from both fields.
        else {
            form.elements[6].setAttribute('value', '');
            form.elements[7].setAttribute('value', '');
            document.querySelector('.sixth input[name="Warranty Begins"]').value = '';   
            document.querySelector('.sixth input[name="Warranty Begins"]').setAttribute('value', '');
            document.querySelector('.sixth input[name="Warranty Ends"]').value = '';
            document.querySelector('.sixth input[name="Warranty Ends"]').setAttribute('value', '');
        }

        // console.log(`Warranty Begins value: ${form.elements[6].getAttribute('value')}`);
        // console.log(`Warranty Ends value: ${form.elements[7].getAttribute('value')}`);
    });

    // # MODAL (NEW ACCOUNT).
    // # Warranty ends field event.
    // + Update field's logical & visible value.
    // + Validate entered date.
    document.querySelector('.sixth input[name="Warranty Ends"]').addEventListener('keydown', function(e) {
        
        let reg = /[0-9]|-|Backspace|Tab/; // Only accepts the previous keys.
        let data = form.elements[7].getAttribute('value');

        if ( !reg.test(e.key) ) 
            e.preventDefault();
        
        else {

            if ( e.key != 'Backspace' && e.key != 'Tab' ) {

                if ( data ) 
                    form.elements[7].setAttribute('value', data.concat(e.key));

                else 
                    form.elements[7].setAttribute('value', e.key);
            }

            else if ( e.key == 'Backspace' ) {
                data = data.substring(0, data.length - 1);
                form.elements[7].setAttribute('value', data);
            }
        }
        
        // console.log(`Warranty Ends value: ${form.elements[7].getAttribute('value')}`);
    });

    // # MODAL (NEW ACCOUNT).
    // # Event listeners for modal's control buttons.
    // + Basics open/close functionality.
    modalButton.addEventListener('click', function() {
        modal.classList.add('visible');
    });

    modalOverlay.addEventListener('click', function() {
        modal.classList.remove('visible');
    });

    // # MODAL (NEW ACCOUNT).
    // + Advance/return functionality.
    modalNext.addEventListener('click', function() {

        if ( modal.actualPhase == 0 ) {

            modalPrevious.removeAttribute('disabled');
            modal.validatePhase();
            modal.next();
        }

        else if ( modal.actualPhase == modal.phases.length - 1 ) 
            modal.validateForm();
        

        else {
            modal.validatePhase();
            modal.next();
        }
    });

    // # MODAL (NEW ACCOUNT).
    // + Return functionality.
    modalPrevious.addEventListener('click', function() {
        modal.prev();
        // modal.validatePhase();
    });

}


// # MODAL (EDIT ACCOUNT).
if ( document.querySelector('#Edit-Account-Modal') ) 
{
    let modal = document.querySelector('#Edit-Account-Modal');
    let modalOverlay = document.querySelector('#Edit-Account-Modal + .overlay');
    let modalSaveButton = modal.querySelector('.buttons .save-button');
    let activeAccountsCards = document.querySelectorAll('.active-accounts-listing .account-row');
    let modalTabs = modal.querySelectorAll('.navigation > .tab');
    let savedAccount = '';
    // console.log(activeAccountsCards);

    // Validation flags for every editable input.
    let flags = new Map();
    flags.set('Warranty Begins', /\d{4}-\d{2}-\d{2}/);
    flags.set('Warranty Ends', /\d{4}-\d{2}-\d{2}/);
    flags.set('Nickname', /[a-zA-Z0-9]/);
    flags.set('Password', /[a-zA-Z0-9]/);
    // flags.set('Link', /^((?!www\.))((?!https\:\/\/).+)((?!http\:\/\/))/i);
    flags.set('Price Paid', /\$\d{2,3}\.00\sMXN/);

    // All inputs nodes.
    let inputs = modal.querySelectorAll('.phases input');

    // All inputs values.
    let inputsValues = new Map;

    // All new values.
    let inputsValuesUpdated = new Set;

    // Dicionary for update requests.
    let dictionary = new Map;
    dictionary.set('Warranty Begins', '__WBEGINS');
    dictionary.set('Warranty Ends', '__WENDS');
    dictionary.set('Nickname', '__NICKNAME');
    dictionary.set('Password', '__PASSWORD');
    dictionary.set('Price Paid', '__PRICE');
    dictionary.set('Available Accounts', '__AVAILABLE_ACCOUNTS');
    
    // console.log(inputs);
    
    // Open/close functionality.
    // Open modal..
    modal.open = function() {
        this.classList.add('visible');
    }
    // Open/close functionality.
    // Close modal.
    modal.close = function() {
        modal.classList.remove('visible');
    }

    // More modal methods.

    // Move in between phases.
    modal.goTo = function(target) {

        let focusedTab = modal.querySelector('.navigation .tab--active');
        focusedTab.classList.remove('tab--active');

        // Remove focused class from active phase..
        modal.querySelector('.phases .focused').classList.remove('focused');

        if ( target.innerHTML == 'STATUS' ) {

            target.classList.add('tab--active');
            modal.querySelector('.phases .status').classList.add('focused');
        }

        if ( target.innerHTML == 'ACCOUNT' ) {

            target.classList.add('tab--active');
            modal.querySelector('.phases .account').classList.add('focused');
        }

        if ( target.innerHTML == 'DETAILS' ) {

            target.classList.add('tab--active');
            modal.querySelector('.phases .details').classList.add('focused');
        }
    };

    // Check for variations on input data.
    modal.isDirty = function(inputLabel) {
        let newData = modal.querySelector(`input[name="${inputLabel}"]`).value;
        let oldData = inputsValues.get(inputLabel);
        // console.log(data);
        if ( newData && oldData && ( newData != oldData ) ) {
            return true;
        }
        return false;
    }

    modal.isValid = function(inputLabel) {
        let data =  modal.querySelector(`input[name="${inputLabel}"]`).value;
        let validationFlag = flags.get(inputLabel);

        if ( validationFlag.test(data) ) {
            return true;
        }

        return false;
    }

    modal.getInfo = function(ID) {
        let request = new XMLHttpRequest();
        let data = new FormData();

        data.append('__PULL', '1');
        data.append('__ACCOUNT', '1');
        data.append('__ACCOUNT_ID', ID);

        request.data = data;

        request.open('POST', './hub.php');

        return request;
    }


    modal.setInfo = function(JSONresponse) {

        // Create variables for every updateable node.
        let accountID = modal.querySelector('.account-id span');
        let warrantyBegins = modal.querySelector('input[name="Warranty Begins"]');
        let warrantyEnds = modal.querySelector('input[name="Warranty Ends"]');
        let nickname = modal.querySelector('input[name="Nickname"]');
        let password = modal.querySelector('input[name="Password"]');
        let pricePaid = modal.querySelector('input[name="Price Paid"]');
        // let link = modal.querySelector('input[name="Link"]');
        let soldAccounts = modal.querySelector('span.sold-accounts');
        let availableAccounts = modal.querySelector('span.total-accounts');
        let vendor = modal.querySelector('a.vendor-link');
        let siteCode = modal.querySelector('.site-code');
        let daysLeft = modal.querySelector('small.days-left');


        // Rewrite every input & extra nodes.
        accountID.innerHTML = JSONresponse['ACCOUNT_ID'];
        warrantyBegins.setAttribute('value', JSONresponse['WARRANTY_BEGINS']);
        warrantyEnds.setAttribute('value', JSONresponse['WARRANTY_ENDS']);
        nickname.setAttribute('value', JSONresponse['ACCOUNT_NICK']);
        password.setAttribute('value', '*'.repeat(JSONresponse['ACCOUNT_PASS'].length));
        password.setAttribute('data-display', JSONresponse['ACCOUNT_PASS']);
        // link.setAttribute('value', JSONresponse['SITE_URL']);
        pricePaid.setAttribute('value', `$${JSONresponse['PRICE_PAID']}.00 MXN`);
        soldAccounts.innerHTML = JSONresponse['N_SOLD'];
        availableAccounts.innerHTML = JSONresponse['N_AVAILABLE'];
        vendor.querySelector('.vendor__label').innerHTML = '@' + JSONresponse['VENDOR_ID'];
        vendor.querySelector('.vendor__avatar').style = `background-image: url('../assets/vendors/${JSONresponse['VENDOR_ID']}.png');`;
        siteCode.innerHTML = JSONresponse['SITE_CODE'];
        daysLeft.innerHTML = getDaysLeft(JSONresponse['WARRANTY_BEGINS']);

        
        // Rewrite inputs value map collection.
        inputsValues.set('Warranty Begins', JSONresponse['WARRANTY_BEGINS']);
        inputsValues.set('Warranty Ends', JSONresponse['WARRANTY_ENDS']);
        inputsValues.set('Nickname', JSONresponse['ACCOUNT_NICK']);
        inputsValues.set('Password', JSONresponse['ACCOUNT_PASS']);
        // inputsValues.set('Link', JSONresponse['SITE_URL']);
        inputsValues.set('Price Paid', `$${JSONresponse['PRICE_PAID']}.00 MXN`);
        inputsValues.set('Accounts Sold', JSONresponse['N_SOLD']);
        inputsValues.set('Accounts Available', JSONresponse['N_AVAILABLE']);

        // Extra code for setting initial state of plus/minus buttons on # accounts.
        if ( Number.parseInt(availableAccounts.innerHTML) > (Number.parseInt(soldAccounts.innerHTML) + 1) ) {
            document.querySelector('button.round.minus').removeAttribute('disabled');
            document.querySelector('button.round.plus').removeAttribute('disabled');
            // console.log(availableAccounts.innerHTML);
            // console.log(soldAccounts.innerHTML + 1);
        }
        else if ( (Number.parseInt(soldAccounts.innerHTML) + 1) == Number.parseInt(availableAccounts.innerHTML) ) {
            document.querySelector('button.round.plus').removeAttribute('disabled');
        }
    }

    // Reset important variables.
    modal.flush = function() {
        // inputsValues = new Map;
        inputsValuesUpdated = new Set;
        if ( !document.querySelector('.buttons .save-button').hasAttribute('disabled') ) {
            document.querySelector('.buttons .save-button').setAttribute('disabled', '');
        }
    }

    // Update modified data.
    modal.update = function(accountID) {
        let request = new XMLHttpRequest;
        request.data = new FormData;

        request.data.append('__PUT', '1');
        request.data.append('__ACCOUNT', '1');
        request.data.append('__ACCOUNT_ID', accountID);

        // Append changed values to the request.

        console.log(inputsValuesUpdated)
        
        for(const inputLabel of inputsValuesUpdated) {
            request.data.append(dictionary.get(inputLabel), inputsValues.get(inputLabel) );
        }

        return request;

    }

    modal.killAccount = function(accountID) {
        let request = new XMLHttpRequest;
        request.data = new FormData;

        request.data.append('__PUT', '1');
        request.data.append('__KILL', '1');
        request.data.append('__ACCOUNT_ID', accountID);

        request.open('POST', './hub.php');
        request.send(request.data);

        return request;
    }


    // Batch setters for various nodes.

    // Attach a event handler to each edit button.
    activeAccountsCards.forEach( card => {
        let editButton = card.querySelector('.edit');
        let accountID = editButton.getAttribute('data-display');

        editButton.addEventListener('click', function(e) 
        {
            // Disabled edit button momentary.
            this.setAttribute('disabled', ''); 

            if ( savedAccount != accountID ) 
            {
                let request = modal.getInfo(accountID);
    
                let promise = new Promise( (resolve, reject) => 
                {
                    // IMAGINARY DELAY.
                    setTimeout( function()
                    { request.send(request.data) }, 3750);
    
                    request.onreadystatechange = function() {
                        // console.log(request);
                        // console.log(`${request.readyState} & ${request.status}`);
                        if ( request.readyState == 4 && request.status == 200 ) {
                            document.querySelector(`.edit[data-display="${accountID}"]`).removeAttribute('disabled');
                            savedAccount = JSON.parse(request.responseText)['ACCOUNT_ID'];
                            resolve(JSON.parse(request.responseText));    
                        }
                    }
    
                    request.onerror = function() {
                        reject('Failed Petition..');
                    }
                    
                });
    
                promise
                    .then( (resp) => {
                        // console.log(resp);
                        modal.setInfo(resp)
                        modal.open();
                    })
                    .catch( (error) => {
                        console.error(error);
                    });
                
            }

            else if ( savedAccount == accountID ) {
                modal.open();
                document.querySelector(`.edit[data-display="${accountID}"]`).removeAttribute('disabled');
            }
            
        });
    });

    
    // Active tab functionality.
    // Set event listener for each individual tab node.
    for (const tab of modalTabs) 
    {
        tab.addEventListener('click', function(e) {
            if ( !(e.target.classList.contains('focused')) ) {
                modal.goTo(e.target);
            }
        });
    }

    // # Inputs general functionality.
    // + Set general event handlers for all input elements.
    for(const input of inputs) 
    {
        let inputName = input.getAttribute('name');
        inputsValues.set(inputName, input.value);

        input.addEventListener('dblclick', function(e) {
            this.removeAttribute('readonly');
            this.setAttribute('focused', '');
        });
        
        input.addEventListener('focusout', function(e) {
            let inputName = e.target.getAttribute('name');

            if ( !this.getAttribute('readonly') ) {
                this.setAttribute('readonly', '');
            }

            if ( modal.isDirty(inputName) ) 
            {
                // console.log(inputsValues);
                if ( modal.isValid(inputName) ) 
                {
                    inputsValues.set(inputName, this.value);
                    inputsValuesUpdated.add(inputName, this.value);
                    modalSaveButton.removeAttribute('disabled');
                }

                else {
                    this.value = inputsValues.get(inputName);
                    // console.log('Dirty But Invalid.');
                }
            }

            // console.log(inputsValues);
        });

        input.addEventListener('keydown', function(e) {

            if ( e.keyCode == 32 ) { // 'Space' key.
                e.preventDefault();
            }
            
            else if ( e.keyCode == 13 ) {  // 'Enter' key.
                this.blur();
            }
            
            // console.log(e)
        });
    }


    // # Individual input & nodes handlers.
    // # Total offers number handler(s).
    // + Minus button handler.
    document.querySelector('button.round.minus').addEventListener('click', function(e) {
        let soldAccounts = modal.querySelector('.label.sold-accounts').innerHTML;
        let totalAccounts = modal.querySelector('.label.total-accounts').innerHTML;

        if ( ( totalAccounts - 1 ) == soldAccounts ) {
            this.setAttribute('disabled', '');
        }

        else if ( totalAccounts > ( soldAccounts - 1 ) ) {
            modal.querySelector('.total-accounts').innerHTML = --totalAccounts;
            inputsValuesUpdated.add('Available Accounts', totalAccounts);
            inputsValues.set('Available Accounts', totalAccounts);

            if (( totalAccounts - 1 ) == soldAccounts ) {
                this.setAttribute('disabled', '');
            }
        }

        if ( document.querySelector('.buttons .save-button').hasAttribute('disabled') ) {
            document.querySelector('.buttons .save-button').removeAttribute('disabled');
        }
    });

    // # Total offers number handler(s).
    // + Plus button handler.
    document.querySelector('button.round.plus').addEventListener('click', function(e) {
        // let soldAccounts = modal.querySelector('.label.sold-accounts').innerHTML;
        let totalAccounts = modal.querySelector('.label.total-accounts').innerHTML;
        modal.querySelector('.label.total-accounts').innerHTML = ++totalAccounts;
        inputsValuesUpdated.add('Available Accounts', totalAccounts);
        inputsValues.set('Available Accounts', totalAccounts);

        if ( document.querySelector('button.round.minus').hasAttribute('disabled') ) {
            document.querySelector('button.round.minus').removeAttribute('disabled');
        }

        if ( document.querySelector('.buttons .save-button').hasAttribute('disabled') ) {
            document.querySelector('.buttons .save-button').removeAttribute('disabled');
        }
        // console.log(inputsValuesUpdated);
    });


    // Password input field handler(s).
    document.querySelector('input[name="Password"]').addEventListener('focusin', function(e) {
        let password = this.getAttribute('data-display');
        this.value = password;
    });

    document.querySelector('input[name="Password"]').addEventListener('focusout', function(e) {
        this.setAttribute('data-display', this.value);
        let passwordLength = this.getAttribute('data-display').length;
        this.value = '*'.repeat(passwordLength);
    });

    document.querySelector('input[name="Password"]').addEventListener('change', function(e) {
        inputsValuesUpdated.add('Password');
        console.log(inputsValuesUpdated);
    });

    // # Price paid input field handler.
    // + Analyze the field's value.
    // + Remove the '$', '.00' & 'MXN' out of the value.
    // + Append new value to inputsValue variable.
    document.querySelector('input[name="Price Paid"]').addEventListener('focusout', function() {

        // Check if the raw input is valid.
        let regEx = /\$\d{1,3}\.00\sMXN/ 
        let data = this.value;

        if ( !regEx.test(data) ) {
            console.log('Price Input: invalid format');
            // Set field's initial value.
            this.value = `$${ inputsValues.get('Price Paid') }.00 MXN`;
            return
        }

        // let regEx2 = /\$|\.|00|\s|MXN/ig;
        data = data.replace(/\$|\.|00|\s|MXN/ig, '');
        inputsValues.set('Price Paid', Number(data));

    });

    // Add kill button handler(s).
    document.querySelector('.buttons .kill-button').addEventListener('click', function(e) {
        let request = modal.killAccount(savedAccount);
        request.onreadystatechange = function(response) {
            if ( request.status == 200 && request.readyState == 4 ) {
                // console.log(request.responseText);
                modal.close();
                modal.flush();
            }
        }
    });


    // + Add save button handler.
    // # Update account.
    document.querySelector('.buttons .save-button').addEventListener('click', function(e) {
        // console.log(savedAccount);
        let request = modal.update(savedAccount);
        request.open('POST', './hub.php');
        request.send(request.data);

        request.onreadystatechange = function(e) {
            // console.log('Woopsie!');
            if ( request.status == 200 && request.readyState == 4 ) {
                modal.close();
                modal.flush();
            }
        }

        request.onerror = function(e) {
            modal.close();
        }
    });

    modalOverlay.addEventListener('click', function(e)
    {
        modal.close();
    }); 
    
}

// # Inactive account modal.
if ( document.querySelector('#Inactive-Account-Modal') ) {

    let modal = document.querySelector('#Inactive-Account-Modal');
    let modalOverlay = document.querySelector('#Inactive-Account-Modal + .overlay');
    // let modalSaveButton = modal.querySelector('.buttons .save-button');
    let inactiveAccountsCards = document.querySelectorAll('.inactive-accounts-listing .account-row');
    // let modalTabs = modal.querySelectorAll('.navigation > .tab');
    let savedAccount = '';



    // ~ Open/close functionality.
    // Open modal.
    modal.open = function() {
        this.classList.add('visible');
    }

    // Close modal.
    modal.close = function() {
        modal.classList.remove('visible');
    }

    // Modal setter(s).
    modal.setInfo = function(JSONresponse) {

        // Create variables for every updateable node.
        let daysAgo = modal.querySelector('small.expiration');
        let finalCause = modal.querySelector('.status .badge').innerHTML;
        let accountID = modal.querySelector('.account-label b');
        let warrantyBegins = modal.querySelector('input[name="Warranty Begins"]');
        let warrantyEnds = modal.querySelector('input[name="Warranty Ends"]');
        let siteCode = modal.querySelector('.site-code');
        let nickname = modal.querySelector('input[name="Nickname"]');
        let password = modal.querySelector('input[name="Password"]');
        let pricePaid = modal.querySelector('span.price-paid');
        // let link = modal.querySelector('input[name="Link"]');
        let soldAccounts = modal.querySelector('.offers-number .remaining-offers');
        let availableAccounts = modal.querySelector('.offers-number .total-offers');
        let vendor = modal.querySelector('a.vendor-link');


        // Rewrite every input & extra nodes.
        accountID.innerHTML = JSONresponse['ACCOUNT_ID'];
        warrantyBegins.setAttribute('value', JSONresponse['WARRANTY_BEGINS']);
        warrantyEnds.setAttribute('value', JSONresponse['WARRANTY_ENDS']);
        nickname.setAttribute('value', JSONresponse['ACCOUNT_NICK']);
        password.setAttribute('value', JSONresponse['ACCOUNT_PASS']);
        // password.setAttribute('data-display', JSONresponse['ACCOUNT_PASS']);
        // link.setAttribute('value', JSONresponse['SITE_URL']);
        vendor.querySelector('.vendor__label').innerHTML = '@' + JSONresponse['VENDOR_ID'];
        vendor.querySelector('.vendor__avatar').style = `background-image: url('../assets/vendors/${JSONresponse['VENDOR_ID']}.png');`;
        pricePaid.innerHTML = `$ ${JSONresponse['PRICE_PAID']}<sup>.00</sup> MXN`;
        soldAccounts.innerHTML = JSONresponse['N_SOLD'];
        availableAccounts.innerHTML = JSONresponse['N_AVAILABLE'];
        siteCode.innerHTML = JSONresponse['SITE_CODE'];
        daysAgo.innerHTML = `${ finalCause } ${ getDaysAgo(JSONresponse['ACTION_DATE']) }`;

        
        // Rewrite inputsvalue map collection.
        // inputsValues.set('Warranty Begins', JSONresponse['WARRANTY_BEGINS']);
        // inputsValues.set('Warranty Ends', JSONresponse['WARRANTY_ENDS']);
        // inputsValues.set('Nickname', JSONresponse['ACCOUNT_NICK']);
        // inputsValues.set('Password', JSONresponse['ACCOUNT_PASS']);
        // inputsValues.set('Link', JSONresponse['SITE_URL']);
        // inputsValues.set('Price Paid', `$${JSONresponse['PRICE_PAID']}.00 MXN`);
        // inputsValues.set('Accounts Sold', JSONresponse['N_SOLD']);
        // inputsValues.set('Accounts Available', JSONresponse['N_AVAILABLE']);

        // Extra code for setting initial state of plus/minus buttons on # accounts.
        if ( Number.parseInt(availableAccounts.innerHTML) > (Number.parseInt(soldAccounts.innerHTML) + 1) ) {
            document.querySelector('button.round.minus').removeAttribute('disabled');
            document.querySelector('button.round.plus').removeAttribute('disabled');
            // console.log(availableAccounts.innerHTML);
            // console.log(soldAccounts.innerHTML + 1);
        }
        else if ( (Number.parseInt(soldAccounts.innerHTML) + 1) == Number.parseInt(availableAccounts.innerHTML) ) {
            document.querySelector('button.round.plus').removeAttribute('disabled');
        }
    }


    // Modal getters.
    modal.getKilledAccount = function(acc) {
        
        let request = new XMLHttpRequest;
        request.data = new FormData;

        request.data.append('__PULL', '1');
        request.data.append('__KILLED_ACCOUNT', '1');
        request.data.append('__ACCOUNT_ID', acc);

        return request;
    };


    inactiveAccountsCards.forEach( card => {

        let editButton = card.querySelector('.edit');
        let accountID = editButton.getAttribute('data-display');

        editButton.addEventListener('click', function(e) {

            // Disabled edit button momentary.
            this.setAttribute('disabled', ''); 
            
            if ( savedAccount != accountID ) 
            {
                let request = modal.getKilledAccount(accountID);

                request.open('POST', './hub.php');
    
                let promise = new Promise( (resolve, reject) => 
                {
                    // Emulate server lag..
                    setTimeout( function()
                    { request.send(request.data) }, 1000);
    
                    request.onreadystatechange = function() {
                        // console.log(request);
                        // console.log(`${request.readyState} & ${request.status}`);
                        if ( request.readyState == 4 && request.status == 200 ) {
                            document.querySelector(`.edit[data-display="${accountID}"]`).removeAttribute('disabled');
                            savedAccount = JSON.parse(request.response)['ACCOUNT_ID'];
                            resolve(JSON.parse(request.response));    
                        }
                    }
    
                    request.onerror = function() {
                        reject('Failed Petition.. Err in Connection(.)');
                    }
                    
                });
    
                promise
                    .then( (resp) => {
                        // console.log(resp);
                        modal.setInfo(resp)
                        modal.open();
                    })
                    .catch( (error) => {
                        console.error(error);
                    });
                
            }

            else if ( savedAccount == accountID ) {
                modal.open();
                document.querySelector(`.edit[data-display="${accountID}"]`).removeAttribute('disabled');
            }
            
        });
    });

    modalOverlay.addEventListener('click', function(e)
    {
        modal.close();
    }); 

    // Reactivate button handler(s).
    modal.querySelector('button.reactivate-button').addEventListener('click', function(e) {
        let promise = new Promise( (resolve, reject) => 
        {
         let request = new XMLHttpRequest();
         let data = new FormData();
         data.append('__PUT', '1');
         data.append('__REVIVE_ACCOUNT', '1');
         data.append('__ACCOUNT_REVIVED', savedAccount);

         request.open('POST', './hub.php');
         request.send(data);

         request.onreadystatechange = function(e) {
             if ( request.status == 200 && request.readyState == 4 )
                 resolve(request.response);
         }

         request.onerror = function(e) {
             reject("Connection Error...");
         }
        });

        promise
        .then( (response) => {
            console.log(response);
            modal.close();
        })
        .catch( (response) => {
            console.error(response);
        })
    });
}







// vendors.php coding.
// List vendors while typing.
if ( document.querySelector('.card-vendors-listing') ) {

    let vendorsCollection = document.querySelectorAll('.vendor-row');


    document.querySelector('#Vendor-Input input').addEventListener('keydown', function(e) {
        let input = this.value;
        let regEx = new RegExp(`^.*(${input}).*$`, 'i');

        let filteredCollection = [];

        for( let vendorNode of vendorsCollection ) {
            let vendor = vendorNode.querySelector('h2.vendor__name').innerHTML;
            if ( regEx.test(vendor) )
                filteredCollection.push(vendorNode);
        }

        document.querySelector('section.content').innerHTML = '';

        if ( filteredCollection.length ) {
            for(let filteredNode of filteredCollection ) {
                let newNode = document.createElement('div');
                newNode.classList.add('vendor-row');
                newNode.setAttribute('data-display', `@${ filteredNode.getAttribute('data-display') }`);
                newNode.innerHTML = filteredNode.innerHTML;
                document.querySelector('section.content').append(newNode);
            }
        }

        else {
            // Fill with original collection.
            for(let originalNode of vendorsCollection ) {
                let newNode = document.createElement('div');
                newNode.classList.add('vendor-row');
                newNode.setAttribute('data-display', `@${ originalNode.getAttribute('data-display') }`);
                newNode.innerHTML = originalNode.innerHTML;
                document.querySelector('section.content').append(newNode);
            }
        }
    });
}








// # NEW VENDOR MODAL.
if ( document.querySelector('#New-Vendor-Modal') ) {

    let modal = new Modal('New-Vendor-Modal');
    let addButton = document.querySelector('button.floating.add-vendor');
    let submitButton = modal.node.querySelector('button.submit');

    let avatarButton = modal.node.querySelector('.vendor__avatar');
    let avatarInput = modal.node.querySelector('form input[name="Avatar"]');

    let vendorInput = modal.node.querySelector('input[name="ID"]');
    let urlInput = modal.node.querySelector('.toolbar input[name="Link Input"]');
    let vendorEmailInput = modal.node.querySelector('input[name="Email"]');

    let avatarFile;

    // + Validate modal.
    modal.validate = function() {

        let inputs = modal.node.querySelectorAll('input[type="text"]');

        for (let input of inputs) {

            if ( !input.value )
                return false;
        }

        if ( !avatarFile ) 
            return false;

        return true;
    }

    // + Submit modal's data.
    submitButton.addEventListener('click', function() {

        if ( modal.validate() ) {

            modal.add('__PUT', '1');
            modal.add('__VENDOR', '1');
            modal.add('__VENDOR_ID', vendorInput.value.replace('@', ''));
            modal.add('__VENDOR_EMAIL', vendorEmailInput.value);
            modal.add('__VENDOR_URL', urlInput.value);
            modal.add('__AVATAR', avatarFile);
            
            modal.upload();
        }

        else 
            throw new Error('Invalid form!');
    });


    // Open modal.
    addButton.addEventListener('click', function(e) {
    modal.open();
    });


    // Open sys file dialog.
    avatarButton.addEventListener('click', function(e) {
        avatarInput.click();
    });

    // + Input validation.
    new validationFlag(vendorInput, 'vendor/id');
    new validationFlag(urlInput, 'vendor/url');
    new validationFlag(vendorEmailInput, 'vendor/email');

    // + Avatar file handler.
    // + Avatar file validation.
    avatarInput.addEventListener('change', function(e) {

        let file = this.files[0];

        if (  file.type == 'image/png' ) {

            let reader = new FileReader();

            reader.readAsDataURL(file);

            reader.onload = function() {
                document.querySelector('.vendor__avatar img').src = reader.result;
                document.querySelector('.vendor__avatar img').style.display = 'block';
                document.querySelector('.vendor__avatar svg').style.display = 'none';
            }

            reader.onloadend = function() {
                avatarFile = file;
            }
        }

        else {
            throw new Error("Wrong file format submitted");
        }
    });

    // + Vendor field allowed keystrokes.
    vendorInput.addEventListener('keydown', function(e) {
        
        let regex = /[a-z0-9]|\d/i;
        let value = this.value;
        
        if ( !regex.test(value) && e.ctrlKey ) {
            e.preventDefault();
            return;
        }

    });

}






// # reclaims.php.
if ( document.querySelector('#Reclaim-Modal') ) {
    let modal = new Modal('Reclaim-Modal');
    
    let reclaimsCollection = document.querySelectorAll('.reclaim-row');

    let resolveButton = modal.node.querySelector('button.resolve');
    let replaceButton = modal.node.querySelector('button.replace');


    modal.fill = function(obj) {
        let reclaim_id = this.node.querySelector('a#reclaim-id'),
            reclaim_date = this.node.querySelector('span#reclaim-date');
        let sale_id = this.node.querySelector('a#sale-id'),
            sale_email = this.node.querySelector('span#email');
        let account_id = this.node.querySelector('a#account-id'),
            account_nick = this.node.querySelector('span#account-nick'),
            account_status = obj['ACCOUNT_STATUS'],
            account_badge = this.node.querySelector('span.badge'),
            account_age = this.node.querySelector('small.detail');
        
        reclaim_id.innerHTML = obj['RECLAIM_ID'];
        reclaim_date.innerHTML = obj['DATE'];

        sale_id.innerHTML = obj['ORDER_ID'];
        sale_email.innerHTML = obj['USER_EMAIL'];

        account_id.innerHTML = obj['ACCOUNT_ID'];
        account_nick.innerHTML = obj['NICKNAME'];
        account_age.innerHTML = `ACCOUNT BOUGHT ${getDaysAgo(obj['ACCOUNT_BOUGHT_DATE'])}`;
        
        switch (account_status) {
            case '1':
                account_badge.innerHTML = 'ACTIVE';
                account_badge.className = '';
                account_badge.classList.add('badge', 'badge-active');
                break;

            case '0':
                account_badge.innerHTML = 'INNACTIVE';
                account_badge.className = '';
                account_badge.classList.add('badge', 'badge-innactive');
                break;

            case 'KILLED':
                account_badge.innerHTML = 'INNACTIVE';
                account_badge.className = '';
                account_badge.classList.add('badge', 'badge-innactive');
                break;
            // TO-DO: ADD MORE BADGES HANDLERS.

            default:
                break;
        }

        if ( obj['RECLAIM_STATUS'] == 1 ) {
            replaceButton.setAttribute('disable', 'true');
            resolveButton.setAttribute('disabled', 'true');
        }

        else if ( obj['RECLAIM_STATUS'] == 0 ) {
            replaceButton.removeAttribute('disabled');
            resolveButton.removeAttribute('disabled');
        }

        // .innerHTML = obj[''];
    };



    modal.flush = function() {
        let reclaim_id = this.node.querySelector('a#reclaim-id'),
            reclaim_date = this.node.querySelector('span#reclaim-date');
        let sale_id = this.node.querySelector('a#sale-id'),
            sale_email = this.node.querySelector('span#email');
        let account_id = this.node.querySelector('a#account-id'),
            account_nick = this.node.querySelector('span#account-nick'),
            // account_status = obj['ACCOUNT_STATUS'],
            account_badge = this.node.querySelector('span.badge'),
            account_age = this.node.querySelector('small.detail');
        
        reclaim_id.innerHTML = '00000-00000';
        reclaim_date.innerHTML = '00/00/00';

        sale_id.innerHTML = 'X00-00000';
        sale_email.innerHTML = '...';

        account_id.innerHTML = '00000-0000';
        account_nick.innerHTML = '...';
        account_age.innerHTML = `ACCOUNT BOUGHT 0 DAYS AGO`;
        account_badge.className = '';
        account_badge.classList.add('badge');
        account_badge.innerHTML = 'UNKNOWN';

        replaceButton.setAttribute('disabled', 'disabled');
        resolveButton.setAttribute('disabled', 'disabled');
    }


    modal.overlay.addEventListener('click', function(e) {
        modal.flush();
    });

    // Set opener of modal.
    reclaimsCollection.forEach( node => {
        node.addEventListener('dblclick', function(e) 
        {
            globalThis.rowTarget = this;
            let reclaimID = this.getAttribute('data-display') || false;

            if ( reclaimID ) {
                modal.open();
                let promise = new Promise( (resolve, reject) => {
                    let request = new XMLHttpRequest();
                    let data = new FormData();
    
                    data.append('__PULL', '1');
                    data.append('__RECLAIM', '1');
                    data.append('__ID', reclaimID);
                    // data.append('__', '');
                    // data.append('__', '');

                    request.open('POST', './hub.php');
                    setTimeout(() => {
                        request.send(data);
                    }, 2225);

                    request.onreadystatechange = function(e) {
                        if ( this.status == 200 && this.readyState == 4 ) {
                            resolve(JSON.parse(this.response));
                        }
                    }

                });    

                promise.then( data => {
                    modal.fill(data);
                    replaceButton.setAttribute('data-display', data['ACCOUNT_ID']);
                });
            }


        });
    });


    // Close modal when button is activated.
    replaceButton.addEventListener('click', function(e) {
        modal.close();
        modal.flush();
    });

    // Close modal when button is activated.
    resolveButton.addEventListener('click', function(e) {
        let request =  new XMLHttpRequest();
        let data = new FormData();
        let reclaimID = modal.node.querySelector('a#reclaim-id').innerHTML;

        data.append('__UPDATE', '1');
        data.append('__SOLVE_RECLAIM', '1');
        data.append('__ID', reclaimID);

        request.open('POST', './hub.php');
        request.send(data);

        request.onreadystatechange = function(e) {
            if ( this.readyState == 4 && this.status == 200 ) {
                console.log(this.responseText);
                globalThis.rowTarget.classList.remove('not-solved');
                globalThis.rowTarget.classList.add('solved');
            }

        };

        modal.close();
        modal.flush();

    });
}



// Reclaims replace account modal functionality.
if ( document.querySelector('#Replace-Account-Modal') ) {
    let modal = new Modal('Replace-Account-Modal');

    let accountID = undefined;

    let reclaimID = document.querySelector('a#reclaim-id').innerHTML;

    let replaceAccountButton = document.querySelector('button.replace');

    let submitButton = modal.node.querySelector('button.submit');

    let nicknameInput = modal.node.querySelector('input[name="RPLCM Nick"]');
    let passwordInput = modal.node.querySelector('input[name="RPLCM Pass"]');

    // Open replacement modal.
    replaceAccountButton.addEventListener('click', function(e) {
        let data = this.getAttribute('data-display') ?? false;

        if ( data ) {
            modal.open();
            accountID = data;
        }
    });


    nicknameInput.addEventListener('keydown', function(e) {
        let regex = /[A-Za-z0-9]|Backspace|Tab|\.|_|-/i;

        if ( !regex.test(e.key) ) {
            e.preventDefault();
        }
    });

    passwordInput.addEventListener('keydown', function(e) {
        let regex = /[A-Za-z0-9]|Backspace|Tab|\.|_|-/i;

        if ( !regex.test(e.key) ) {
            e.preventDefault();
        }

    });

    submitButton.addEventListener('click', function(e) {
        let regex = /([A-Za-z0-9]|\.|-|_){4,}/;

        if ( regex.test( passwordInput.value ) && regex.test( nicknameInput.value ) ) {
            modal.close();
            let request = new XMLHttpRequest();
            let data = new FormData();

            data.append('__PUT', '1');
            data.append('__REPLACE_ACCOUNT', '1');
            data.append('__ACCOUNT_ID', accountID);
            data.append('__NICKNAME', nicknameInput.value);
            data.append('__PASS', passwordInput.value);
            

            request.open('POST', './hub.php');
            setTimeout(() => {
                request.send(data);
            }, 1500);

            request.onreadystatechange = function(e) {
                if ( this.status == 200 && this.readyState == 4 ) 
                {
                    if ( /@@/.test(this.responseText) ) 
                    {
                        let request = new XMLHttpRequest();
                        let data = new FormData();

                        data.append('__UPDATE', '1');
                        data.append('__RECLAIM', '1');
                        data.append('__ID', reclaimID);
                        // data.append('__NICKNAME', nicknameInput.value);
                        // data.append('__PASS', passwordInput.value);
                        

                        request.open('POST', './hub.php');
                        setTimeout(() => {
                            request.send(data);
                        }, 1500);

                        request.onreadystatechange = function(e) {
                            if ( this.readyState == 4 && this.status == 200 ) 
                            {
                                globalThis.rowTarget.classList.remove('not-solved');
                                globalThis.rowTarget.classList.add('solved');

                                let request = new XMLHttpRequest();
                                let data = new FormData();

                                data.append('__UPDATE', '1');
                                data.append('__SOLVE_RECLAIM', '1');
                                data.append('__ID', globalThis.rowTarget.getAttribute('data-display'));
                                

                                request.open('POST', './hub.php');
                                request.send(data);
                            }
                        }
                    }
                }
            }
        }
    });
}



// Messages page coding.
if ( document.querySelector('.card-messages-listing') ) {
    let messagesCollection = {};
    let links = document.querySelectorAll('ul.pagination a');
    let linksContainer = document.querySelector('ul.pagination');
    let category = 'ALL'; // Initial category.
    let actualPage = 1;

    let content = document.querySelector('section.content');

    messagesCollection[1] = [];

    // Get initial messages collection.
    document.querySelectorAll('div.message-row').forEach( (node) => {
        messagesCollection[1].push(node);
    });


    // + Add event handler for links container.
    linksContainer.addEventListener('click', function(e) {
        
        if ( e.target.tagName === 'A' ) {
            let page = e.target.innerHTML;

            if ( !( page in messagesCollection ) ) {

                let request = Request({ '__PULL': '1',  
                                        '__MESSAGES_PAGE': page,
                                        '__CATEGORY': category });

                request.onreadystatechange = function(ev) {
                    if ( this.readyState == 4 && this.status == 200 ) {

                        setTimeout( function() {
                            
                            messagesCollection[page] = [];
                            let res = JSON.parse(request.response);

                            document.querySelector('ul.pagination').classList.remove('loading');
                            document.querySelector('ul.pagination li.link--active ').classList.remove('link--active');
                            e.target.parentElement.classList.add('link--active');
                            document.querySelector('section.content').innerHTML = '';


                            for (let message of res) {
                                
                                let node = Factory.createMessageRow(message);
                                Factory.setMessageRow(node);
                                document.querySelector('section.content').appendChild(node);
                                messagesCollection[page].push(node);
                            }

                        }, 2500);
                    }
                }
    
                request.onload = function(e) {
                    actualPage = page;
                    document.querySelector('ul.pagination').classList.add('loading');
                }

            }

            else {
                document.querySelector('section.content').innerHTML = '';
                document.querySelector('ul.pagination li.link--active ').classList.remove('link--active');
                e.target.parentElement.classList.add('link--active');

                for ( let message of messagesCollection[page]  ) {
                    document.querySelector('section.content').append(message);
                }
            }
            }
        });

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
    document.querySelector('.toolbar.selection').addEventListener('click', function(e) {

        if ( e.target.tagName !== 'LI' ) return; // Target ONLY list items.
        
        let cat = this.getAttribute('data-display');

        if ( category !== cat ) {

            category = cat;
            messagesCollection = {};

            Request({
                '__PULL': '1',
                '__TOTAL_MESSAGES': '1',
                '__CATEGORY': category,
            })
            .onreadystatechange = function(e) {
                if ( this.readyState == 4 && this.status == 200 ) {
                    let messages = JSON.parse(this.response);
                    content.innerHTML = '';
                    
                    Pagination.rewrite(document.querySelector('ul.pagination'), messages['TOTAL'], Pagination.MESSAGES_PER_PAGE);

                    for(let index in messages) {
                        if ( Number.isNaN(Number.parseInt(messages[index])) ) {
                            let node = Factory.createMessageRow(messages[index]);
                            Factory.setMessageRow(node);
                            content.appendChild(node);
                            // console.log(messages[index]);
                        }
                    }
                }
            }
        }

        else if ( category != cat && category == 'ALL' ) {
            category = cat;
            messagesCollection = {};

            Request({
                '__PULL': '1',
                '__TOTAL_MESSAGES': '1',
                '__CATEGORY': '',
            })
            .onreadystatechange = function(e) {
                
                if ( this.readyState == 4 && this.status == 200 ) {
                    let messages = JSON.parse(this.response);
                    Pagination.rewrite(document.querySelector('ul.pagination'), messages['TOTAL'], Pagination.MESSAGES_PER_PAGE);
                }
            }
        }
    });


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