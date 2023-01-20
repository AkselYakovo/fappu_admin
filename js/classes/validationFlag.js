export class validationFlag {

    constructor(inputNode, option) {
        this.collection = [];
        switch (option) 
        {
            case 'price/month':

                inputNode.addEventListener('keydown', function(e) 
                {
                    let regEx = /(\d|Backspace)|Tab/;
                    let inputVal = inputNode.getAttribute('value');
            
                    e.preventDefault();

                    if( regEx.test(e.key) ) 
                    {
                        // If The User Doesn't Digit Either A Digit Or Backspace Key..
                        if ( e.key == 'Backspace' ) {
                            let price = inputVal.substring(1, inputVal.indexOf('.'));
                            // If Price Quantity Isn't Empty.
                            if ( price ) {
                                let newData = price.substring(0, price.length - 1);
                                let data = `$${newData}.00 MXN/MES`;
                                this.setAttribute('value', data);
                            }
                            else {
                                this.setAttribute('value', '');
                            }

                        }
                        // If A Digit Is Entered..
                        else if ( e.key != 'Backspace' && e.key != 'Tab' ) {
                            // If Input Node Isn't Empty
                            if ( inputNode.getAttribute('value') ) {
                                let price = inputVal.substring(1, inputVal.indexOf('.'));
                                let data = `$${price.concat(e.key)}.00 MXN/MES`;
                                this.setAttribute('value', data);
                            }
                            // If Input Node Is Initially Empty..
                            else {
                                let data = `$${e.key}.00 MXN/MES`;
                                this.setAttribute('value', data);
                            }
                        }
                        else {
                            // Do A Tabulation.
                        }
                    }
                });

                break;

            case 'url/website':

                inputNode.addEventListener('keydown', function(e) 
                {
                    let regEx = /(\b|\.|\d|Backspace|\/)/;
                    if ( !regEx.test( e.key ) ) {
                        e.preventDefault();                    
                    }
                });

                inputNode.addEventListener('focusout', function(e) {
                    let data = this.value;
                    data = data.replace(/^www\./i, '');
                    this.value = data;
                });

                break;

            case 'sitecode/website':

                inputNode.addEventListener('keydown', function(e) {
                    let regEx = /\b|\d|Backspace|Tab/i;
                    if ( !regEx.test( e.key ) ) {
                        e.preventDefault();
                    }
                });

                inputNode.addEventListener('focusout', function(e) {
                    let regEx = /.{2,10}/;
                    let data = inputNode.value;
                    if ( !regEx.test( data ) ) {
                        inputNode.value = '';
                    }
                });
                break;

            case 'sitetitle/website':

                inputNode.addEventListener('keydown', function(e) {
                    let regEx = /[A-Z]|Backspace|Tab/i;
                    if ( !regEx.test( e.key ) ) {
                        e.preventDefault();
                    }
                });
                break;

            case 'vendor/id':

                inputNode.addEventListener('keydown', function(e) {
                    let regEx = /[A-Z0-9]|Backspace|Tab/i
                    if ( !regEx.test( e.key ) ) {
                        e.preventDefault();
                    }
                });

                inputNode.addEventListener('focusout', function(e) {
                    if ( !/@/.test(this.value) ) {
                        this.value = '@' + this.value;
                    }
                });
                break;
        
            default:
                console.error('No Validation Flag Selected.');
                break;

            case 'vendor/url':
                inputNode.addEventListener('keydown', function(e) {
                    let regEx = /[A-Z0-9]|\.|\/|@|Backspace|Tab/i
                    if ( !regEx.test( e.key ) ) {
                        e.preventDefault();
                    }
                });
                break;
            
            case 'vendor/email':
                inputNode.addEventListener('keydown', function(e) {
                    let regEx = /[A-Z0-9]|@|\.|_|-|Backspace|Tab/i
                    if ( !regEx.test( e.key ) ) {
                        e.preventDefault();
                    }
                });
        }
    }


    static getFlag(flag) {
        switch (flag) {
            case 'sitecode/website':
                return /[A-Za-z]{4,}/;
                break;
        
            case 'price/month':
                return /^\$\d{2,3}\.00\sMXN\/MES/i;
                break;

            case 'url/website':
                return /\w{3,}\.\w{2,4}/i;
                break;
            
            case 'sitetitle/website':
                return /[A-Za-z]{3,}/i
                break;

            case 'vendor/id':
                return /@\d{3,15}/i
                break;

            default:
                console.log('Invalid/Inexistent Flag.');
                break;
        }
    }
}