import { getDaysAgo } from "./date.js";

export class Factory {

    static createMessageRow(data) {
        let messageNode = document.createElement('div');
        messageNode.classList.add('message-row');
        messageNode.setAttribute('data-display', data['MESSAGE_ID']);

        messageNode.innerHTML = 
        `
            <div class="message-info">
                <h2 class="regard">${data['CATEGORY_LABEL']} ISSUES</h2>
                <small class="date">HACE ${getDaysAgo(data['DATE'])}</small>
                <span class="email">${data['USER_EMAIL']}</span>
            </div>
            <p class="message">${data['MESSAGE']}</p>
        `;
        return messageNode;
    }

    static setMessageRow(messageNode) {
        messageNode.addEventListener('click', function(e) {
            console.log('message row node set !');
        });
    }



    static setPaginationLink(linkNode) {
        linkNode.addEventListener('click', function(e) {

        });
    }

    static createSelectionOption(data) {
        const node = document.createElement('li');
        node.classList.add('option');
        node.textContent = data['SITE_TITLE'];
        node.setAttribute('data-display', data['SITE_CODE']);
        node.setAttribute('title', data['SITE_TITLE']);
        node.setAttribute('draggable', false)
        return node;
    }

    static swapInstance(oldNode, newNode) {
        const parentElement = oldNode.parentElement;

        if ( parentElement ) parentElement.replaceChild(newNode, oldNode);
        else document.replaceChild(newNode, oldNode);

        return new Promise( (resolve, reject) => {
            setTimeout(() => {
                resolve(newNode);
            }, 0);
        } );
    }

}