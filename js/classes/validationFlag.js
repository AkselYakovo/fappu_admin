export class validationFlag {

    constructor(inputNode, option) {

        this.collection = [];
        switch (option) {

            case 'price/month':

                inputNode.addEventListener('keydown', function(e) {

                    let regEx = /(\d|Backspace)|Tab/;
                    let inputVal = inputNode.getAttribute('value');
            
                    e.preventDefault();

                    if( regEx.test(e.key) ) {

                        // If the user doesn't digit either a digit or backspace key.
                        if ( e.key == 'Backspace' ) {

                            let price = inputVal.substring(1, inputVal.indexOf('.'));
                            // If price quantity isn't empty.
                            if ( price ) {

                                let newData = price.substring(0, price.length - 1);
                                let data = `$${newData}.00 MXN/MES`;
                                this.setAttribute('value', data);
                            }
                            else 
                                this.setAttribute('value', '');
                            

                        }

                        // If a digit is entered.
                        else if ( e.key != 'Backspace' && e.key != 'Tab' ) {

                            // If input node isn't empty.
                            if ( inputNode.getAttribute('value') ) {

                                let price = inputVal.substring(1, inputVal.indexOf('.'));
                                let data = `$${price.concat(e.key)}.00 MXN/MONTH`;
                                this.setAttribute('value', data);
                            }

                            // If input node is initially empty.
                            else {
                                let data = `$${e.key}.00 MXN/MONTH`;
                                this.setAttribute('value', data);
                            }
                        }
                        else {
                            // Do a tabulation.
                        }
                    }
                });

                break;

            case 'url/website':

                inputNode.addEventListener('keydown', function(e) {

                    let regEx = /(\b|\.|\d|Backspace|\/)/;
                    if ( !regEx.test( e.key ) ) 
                        e.preventDefault();                    
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
                    if ( !regEx.test( e.key ) ) 
                        e.preventDefault();
                });

                inputNode.addEventListener('focusout', function(e) {

                    let regEx = /.{2,10}/;
                    let data = inputNode.value;
                    if ( !regEx.test( data ) ) 
                        inputNode.value = '';
                });
                break;

            case 'sitetitle/website':

                inputNode.addEventListener('keydown', function(e) {

                    let regEx = /[A-Z]|Backspace|Tab/i;
                    if ( !regEx.test( e.key ) ) 
                        e.preventDefault();
                });
                break;

            case 'vendor/id':

                inputNode.addEventListener('keydown', function(e) {

                    let regEx = /[A-Z0-9]|Backspace|Tab/i
                    if ( !regEx.test( e.key ) ) 
                        e.preventDefault();
                });

                inputNode.addEventListener('focusout', function(e) {
                    
                    if ( !/@/.test(this.value) ) 
                        this.value = '@' + this.value;
                });
                break;
        
            default:
                console.error('No Validation Flag Selected.');
                break;

            case 'vendor/url':
                inputNode.addEventListener('keydown', function(e) {

                    let regEx = /[A-Z0-9]|\.|\/|@|Backspace|Tab/i
                    if ( !regEx.test( e.key ) ) 
                        e.preventDefault();
                });
                break;
            
            case 'vendor/email':
                inputNode.addEventListener('keydown', function(e) {

                    let regEx = /[A-Z0-9]|@|\.|_|-|Backspace|Tab/i
                    if ( !regEx.test( e.key ) )
                        e.preventDefault();
                });
        }
    }


    static getFlag(flag) {

        switch (flag) {

            case 'sitecode/website':
                return /^[A-Za-z]{2,7}$/;
        
            case 'price/month':
                return /^\$((?!(0))\d{1,3})\.(?=(0))00\sMXN\/MONTH$/i;

            case 'url/website':
                return /^\w{2,}\.\w{2,4}$/i;
            
            case 'sitetitle/website':
                return /^[A-Z]{3,}$/i

            case 'vendor/id':
                return /^@\d{3,15}$/i

            default:
                console.log('Invalid/Inexistent Flag. Found');
                break;
        }
    }
}