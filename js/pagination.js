export class Pagination {
    static MESSAGES_PER_PAGE = 1;
    
    static rewrite(parentNode, total, nperpage) {
        let totalLinks = Math.round(total / nperpage);
        parentNode.innerHTML = '';

        if ( totalLinks ) 
        {
            for(let i = 1; i <= totalLinks; i++) {
                let node = document.createElement('li');
                node.classList.add('link');
                node.innerHTML = '<a href="#">' + i + '</a>';
                if ( i == 1 ) {
                    node.classList.add('link--active');
                }
                parentNode.appendChild(node);
            }
        }

        else {
            throw new Error('OMG, Zero Links.')
        }

    }
}