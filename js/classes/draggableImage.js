export class draggableImage {

    constructor(targetNode) {
        this.node = targetNode;
        let parent = targetNode.parentElement;
        let parentCoords = makeCoords(parent);
        
        
        targetNode.addEventListener('mousedown', function(e){
            let initialMouseCoords = {
                'X': e.clientX,
                'Y': e.clientY
            };

            targetNode.initialCoords = {
                'X': ( getTranslateX(targetNode) ) 
                     ? Number.parseInt( getTranslateX(targetNode) ) 
                     : '0',
                'Y': ( getTranslateY(targetNode) ) 
                     ? Number.parseInt( getTranslateY(targetNode) ) 
                     : '0',
            };

            let nodeTransformString = ( targetNode.style.transform.length ) 
                                      ? targetNode.style.transform 
                                      : 'scale(1.0)';

            let actualScale = nodeTransformString.replace(/translate\((-?\d{1,})*px, (-?\d{1,})*px\)/ig, '');
            // console.log(nodeTransformString);
            // console.log(actualScale);

            document.onmousemove = function(event) {
                targetNode.finalCoords = makeCoords(targetNode);
                let diffCoords = {
                    'X': event.clientX,
                    'Y': event.clientY
                };
                
                // targetNode.style.left = targetNode.initialCoords.X - (initialMouseCoords.X - diffCoords.X) + 'px';
                // targetNode.style.top = targetNode.initialCoords.Y - (initialMouseCoords.Y - diffCoords.Y) + 'px';

                targetNode.style.transform = `translate(${targetNode.initialCoords.X - (initialMouseCoords.X - diffCoords.X)}px, ${targetNode.initialCoords.Y - (initialMouseCoords.Y - diffCoords.Y)}px) ${ actualScale }`;
                targetNode.ontransitionend = function() {
                    targetNode.style.transition = null;
                };

                document.onmouseup = function() {
                    
                    

                    // // LEFT EDGE AUTO POSITIONING...
                    if ( targetNode.finalCoords.topLeft.X > parentCoords.topLeft.X ) 
                    {
                        // console.log('Excess N\' Left!')
                        targetNode.style.transition = '200ms transform ease';
                        let actualCoord = Math.floor( Number.parseFloat( getTranslateX(targetNode) ) ); 
                        let newCoord = Math.floor( targetNode.finalCoords.topLeft['X'] - parentCoords.topLeft['X'] );;
                        targetNode.style.transform = `translate(${ actualCoord - newCoord }px, ${ Number.parseInt( getTranslateY(targetNode) ) }px) ${ actualScale }`;
                    }
                    // TOP EDEGE AUTO POSITIONING...
                    if ( targetNode.finalCoords.topLeft.Y > parentCoords.topLeft.Y ) {
                        // console.log('Excess N\' Top')
                        targetNode.style.transition = '200ms transform ease';
                        let actualCoord = Math.floor( Number.parseFloat( getTranslateY(targetNode) ) ); 
                        let newCoord = Math.floor( targetNode.finalCoords.topRight['Y'] - parentCoords.topRight['Y'] );
                        targetNode.style.transform = `translate(${ Number.parseInt( getTranslateX(targetNode) ) }px, ${ actualCoord - newCoord }px) ${ actualScale }`;
                    }
                    // RIGHT EDGE AUTO POSITIONING...
                    if ( targetNode.finalCoords.topRight.X < parentCoords.topRight.X ) {
                        // console.log('Excess N\' Right!')
                        targetNode.style.transition = '200ms transform ease';
                        let actualCoord = Math.floor( Number.parseFloat( getTranslateX(targetNode) ) ); 
                        let newCoord = Math.floor( parentCoords.topRight['X'] - targetNode.finalCoords.topRight['X'] );
                        targetNode.style.transform = `translate(${ actualCoord + newCoord }px, ${ Number.parseInt( getTranslateY(targetNode) ) }px) ${ actualScale }`;
                    }
                    // BOTTOM EDGE AUTO POSITIONING...
                    if ( targetNode.finalCoords.bottomRight.Y < parentCoords.bottomRight.Y ) {
                        // console.log('Excess N\' Bottom!')
                        targetNode.style.transition = '200ms transform ease';
                        let actualCoord = Math.floor( Number.parseFloat( getTranslateY(targetNode) ) ); 
                        let newCoord = Math.floor( parentCoords.bottomRight['Y'] - targetNode.finalCoords.bottomRight['Y'] );
                        targetNode.style.transform = `translate(${ Number.parseInt( getTranslateX(targetNode) ) }px, ${ actualCoord + newCoord }px) ${ actualScale }`;
                    }                


                    document.onmouseup = null;
                }
                
            };

            // Clean Drag Listener..
            document.addEventListener('mouseup', (event) => {
                document.onmousemove = null;
            });
            
        }); 
    }

    
}

function makeCoords(node) {
    let coords = node.getBoundingClientRect();
    let coordsObj = {
        topLeft: {
            'Y': coords.top,
            'X': coords.left
        },
        topRight: {
            'Y': coords.top,
            'X': coords.right
        },
        bottomLeft: {
            'Y': coords.bottom,
            'X': coords.left
        },
        bottomRight: {
            'Y': coords.bottom,
            'X': coords.right
        }
    };

    return coordsObj;
}

function getTranslateX(node) {
    let regEx = /translate\((-?\d{1,})*px, (-?\d{1,})*px\)/i;
    let string = node.style.transform;

    if ( regEx.test(string) ) {
        let numberValues = string.substr(string.indexOf('(') + 1, string.length - 1);
        let coord = numberValues.substr(0, numberValues.indexOf(','));
        // console.log(numberValues);
        // console.log(coord);
        return coord;
    }

    return false;
}

function getTranslateY(node) {
    let regEx = /translate\((-?\d{1,})*px, (-?\d{1,})*px\)/i;
    let string = node.style.transform;

    if ( regEx.test(string) ) {
        let numberValues = string.substr( string.indexOf('(') + 1, string.length - 1 );
        let coord = numberValues.substr( numberValues.indexOf(',') + 2, numberValues.indexOf(')') + 1);

        return coord;
    }

    return false;
}

export function getOrigin(parentNode, childNode) {
    let child = makeCoords(childNode);
    let parent = makeCoords(parentNode);
    let origin = {
        'X': parent.topLeft['X'] - child.topLeft['X'],
        'Y': parent.topLeft['Y'] - child.topLeft['Y']
    }
    return origin;
}