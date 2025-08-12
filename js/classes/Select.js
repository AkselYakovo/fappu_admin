import { Factory } from "../factory.js";
import { Scroller } from "./Scroller.js";

const template = document.createElement('template');
template.innerHTML = `
<style>
    @import url('../css/style.css');
</style>

<div class="selection toolbar selection--options-loading" data-display="" id="Site-Selection">
    <div class="main-bar">
        <span class="label">SELECTION</span>
        <svg width="18" height="10" viewBox="0 0 18 10" fill="#FFFFFF" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.30912 9.33979C8.69565 9.70916 9.30435 9.70916 9.69088 9.33979L16.7233 2.61952C17.3753 1.99643 16.9343 0.896553 16.0324 0.896553H1.9676C1.06571 0.896553 0.62468 1.99643 1.27672 2.61952L8.30912 9.33979Z"/>
        </svg>
    </div>
    <div class="options-wrapper">
        <ul class="options-list"></ul>
    </div>
</div>
`;

class Select extends HTMLElement {
    static observedAttributes = ['label'];

    constructor() {
        super();
    }

    connectedCallback() {
        const clone = template.content.cloneNode(true);
        this.root = this.attachShadow({ mode: 'closed' });
        this.root.append(clone);
        
        this.root.querySelector('span.label').innerHTML = this.label ?? 'SELECT';

        this.optionChosen = null;
        
        this.node = this.root.querySelector('.selection.toolbar');
        this.node.list = this.node.querySelector('ul.options-list');
        this.node.label = this.node.querySelector('span.label');
        
        this.node.addEventListener('click', (e) => {

            if ( e.target.classList.contains('option') ) {

                if ( this.optionChosen ) {
                    this.optionChosen.node.classList.remove('option--active');
                }

                this.optionChosen = {
                    node: e.target,
                    title: e.target.textContent,
                    code: e.target.getAttribute('data-display')
                }

                this.optionChosen.node.classList.add('option--active');

                this.setLabel(this.optionChosen.title);
            }


            this.toggleList();
        });
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this[name] = newValue;
    }

    getOption(input) {
        if(this.options) {
            const defaultOption = this.options.find( opt => (opt['SITE_CODE'] === input)  || 
                                                            (opt['SITE_TITLE'] === input));
            return defaultOption || false;
        }
    }
    
    setInitialLabel(label) {
        if( label && label !== '' ) {
            this.label = label;
            this.node.label.innerHTML = label;
        }
    }

    setLabel(label) {
        const option = this.getOption(label);
        if( label && label !== '' && option ) {
            this.label = label;
            this.node.label.innerHTML = label;
            this.node.setAttribute('data-display', option['SITE_CODE']);
        } else {
            throw new Error('Invalid label:', label);
        }
    }

    setDefault(option) {
        const optionSelected = this.getOption(option);
        console.log(optionSelected['SITE_TITLE']);
        if ( optionSelected ) {
            this.setLabel(optionSelected['SITE_TITLE']);
        } else {
            throw new Error(`Invalid option '${ option }'`);
        }
    }

    setOptions(optionsList) {
        if ( !Array.isArray(optionsList) ) throw new Error(`Select component was expecting an array and not a ${ typeof optionsList }`);
        
        for (let index = 0; index < optionsList.length; index++) {
            const optionNode = Factory.createSelectionOption(optionsList[index]);
            this.node.list.append(optionNode);
        }

        this.options = optionsList;
        this.bootstrapListListeners();
        this.optionsFinishLoading();
    }

    toggleList() {
        this.node.classList.toggle('selection--options-active');
    }

    bootstrapListListeners() {
        const options = {
            visibleArea: { Y: (156 - 40)},
            stepSize: 39
        };

        const optionsWrapper = new Scroller(this.node.list, options);
    }

    optionsFinishLoading() {
        if (this.node.classList.contains('selection--options-loading')) {
            this.node.classList.remove('selection--options-loading');
        }
    }

}

window.customElements.define('select-emphasized', Select);

export default Select
