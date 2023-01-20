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
            let scaleLessTransformString = this.node.style.transform.replace(/scale\(\d\.\d\)\s?/g, '');
            console.log(scaleLessTransformString)
            let newTransformString = `${ scaleLessTransformString } scale(${ this.actualScale })`;
            this.node.style.transform = newTransformString;
            // console.warn( this.node.getBoundingClientRect() );
        }
    };

    zoomOut() {
        if ( this.actualScale > this.minScale ) {
            this.actualScale -= 0.1;
            let scaleLessTransformString = this.node.style.transform.replace(/scale\(\d\.\d\)\s?/g, '');
            let newTransformString = `${ scaleLessTransformString } scale(${ this.actualScale })`;
            this.node.style.transform = newTransformString;
        }
    }

    // Getters.

    getScale() {
        return this.actualScale;
    }

}