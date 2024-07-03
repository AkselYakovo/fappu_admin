export class zoomableImage {

    actualScale = 1.0;
    node;
    maxScale = 2;
    minScale = 1;

    constructor(pictureNode) {
        this.node = pictureNode;
    }


    zoomIn() {
        if ( this.actualScale < this.maxScale ) {
            this.actualScale += 0.1;
            let translateStringRegExp = /translate\(-?\d{1,}px, -?\d{1,}px\)/ig;
            let translateString = translateStringRegExp.exec(this.node.style.transform);
            let transformString = ( translateString ) 
                                  ? `${ translateString[0] } scale(${ this.actualScale })`
                                  : `translate(0px, 0px) scale(${ this.actualScale })`;
            this.node.style.transform = transformString;
        }
    };

    zoomOut() {
        if ( this.actualScale > this.minScale ) {
            this.actualScale -= 0.1;
            let translateStringRegExp = /translate\(-?\d{1,}px, -?\d{1,}px\)/ig;
            let translateString = translateStringRegExp.exec(this.node.style.transform);
            let transformString = ( translateString ) 
                                  ? `${ translateString[0] } scale(${ this.actualScale })`
                                  : `translate(0px, 0px) scale(${ this.actualScale })`;
            this.node.style.transform = transformString;
        }
    }

    // Getters.

    getScale() {
        return this.actualScale;
    }

}