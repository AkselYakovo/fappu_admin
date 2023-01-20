import { getDaysAgo } from "./date.js";

export class Factory {

    static createMessageRow(data) {
        let messageNode = document.createElement('div');
        messageNode.classList.add('message-row');
        messageNode.setAttribute('data-display', data['MESSAGE_ID']);

        messageNode.innerHTML = 
        `
            <div class="message-info">
                <h2 class="regard">${data['CATEGORY']} ISSUES</h2>
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

}