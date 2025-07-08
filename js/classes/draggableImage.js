export class draggableImage {

    constructor(targetNode) {
        this.node = targetNode;
        this.isAdjusting = false;
        this.parent = targetNode.parentElement || targetNode.parentNode.host;
        
        targetNode.addEventListener('mousedown', function(e){
            const draggableImage = this
            let initialMouseCoords = {
                'X': e.clientX,
                'Y': e.clientY
            };

            targetNode.initialCoords = {
                'X': ( getTranslateX(targetNode) )
                     ? ( getTranslateX(targetNode) )
                     : '0',
                'Y': ( getTranslateY(targetNode) )
                     ? ( getTranslateY(targetNode) )
                     : '0',
            };

            let currentTransformString = ( targetNode.style.transform.length )
                                         ? targetNode.style.transform
                                         :'scale(1.0)';

            let actualScaleRegExp = /(?!scale\()(\d{1}(\.\d{1})?)(?=\))/i;
            let actualScale = actualScaleRegExp.exec(currentTransformString)[0];

            document.onmousemove = function(event) {
                let currentMouseCoords = {
                    'X': event.clientX,
                    'Y': event.clientY
                };

                let finalPositionX = targetNode.initialCoords.X - (initialMouseCoords.X - currentMouseCoords.X);
                let finalPositionY = targetNode.initialCoords.Y - (initialMouseCoords.Y - currentMouseCoords.Y);
                if ( !this.isAdjusting ) {
                    targetNode.style.transform = `translate(${ finalPositionX }px, ${ finalPositionY }px) scale(${ actualScale })`;
                }
            };

            document.onmouseup = function() {
                targetNode.finalCoords = makeCoords(targetNode);
                let finalCoord = { X: null, Y: null };
                let parentCoords = makeCoords(draggableImage.parent)

                // // LEFT EDGE AUTO POSITIONING...
                if ( targetNode.finalCoords.topLeft.X > parentCoords.topLeft.X )
                {
                    // console.log('Excess N\' Left!')
                    this.isAdjusting = true;
                    let actualCoord = getTranslateX(targetNode);
                    let newCoord = targetNode.finalCoords.topLeft['X'] - parentCoords.topLeft['X'];
                    finalCoord.X = actualCoord - newCoord;
                }
                // RIGHT EDGE AUTO POSITIONING...
                else if ( targetNode.finalCoords.topRight.X < parentCoords.topRight.X ) {
                    // console.log('Excess N\' Right!')
                    this.isAdjusting = true;
                    let actualCoord = getTranslateX(targetNode);
                    let newCoord = parentCoords.topRight['X'] - targetNode.finalCoords.topRight['X'];
                    finalCoord.X = actualCoord + newCoord;
                }
                // TOP EDGE AUTO POSITIONING...
                if ( targetNode.finalCoords.topLeft.Y > parentCoords.topLeft.Y ) {
                    // console.log('Excess N\' Top')
                    this.isAdjusting = true;
                    let actualCoord = getTranslateY(targetNode);
                    let newCoord = targetNode.finalCoords.topRight['Y'] - parentCoords.topRight['Y'];
                    finalCoord.Y = actualCoord - newCoord;
                }
                // BOTTOM EDGE AUTO POSITIONING...
                else if ( targetNode.finalCoords.bottomRight.Y < parentCoords.bottomRight.Y ) {
                    // console.log('Excess N\' Bottom!')
                    this.isAdjusting = true;
                    let actualCoord = getTranslateY(targetNode);
                    let newCoord = parentCoords.bottomRight['Y'] - targetNode.finalCoords.bottomRight['Y'];
                    finalCoord.Y = actualCoord + newCoord;
                }

                if ( this.isAdjusting ) targetNode.style.transition = '200ms transform ease';

                finalCoord.X = finalCoord.X ?? getTranslateX(targetNode);
                finalCoord.Y = finalCoord.Y ?? getTranslateY(targetNode);

                targetNode.style.transform = `translate(${ finalCoord.X }px, ${ finalCoord.Y }px) scale(${ actualScale })`;

                document.onmouseup = null;
                document.ontransitionend = () => {
                    targetNode.style.transition = null;
                    document.ontransitionend = null;
                    this.isAdjusting = false;
                }
            }

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
    let regExp = /translate\((-?\d{1,}\.?\d*)px(?:, -?\d{1,}\.?\d*px)?\)/i;
    let transformString = node.style.transform;
    
    if ( regExp.test(transformString) ) {
        let currentX = regExp.exec(transformString)[1];
        return Number.parseInt(currentX);
    }

    return false;
}

function getTranslateY(node) {
    let regExp = /translate\(-?\d{1,}\.?\d*px, (-?\d{1,}\.?\d*)px\)/i;
    let transformString = node.style.transform;

    if ( regExp.test(transformString) ) {
        let currentY = regExp.exec(transformString)[1];
        return Number.parseInt(currentY);
    }
    else {
        let regExp = /translate\((-?\d{1,})px(?:, -?\d{1,}px)?\)/i;
        if ( regExp.test(transformString) ) return 0;
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