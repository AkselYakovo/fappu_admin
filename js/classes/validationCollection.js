export class validationCollection {
    
    constructor() {
        this.collection = {}
        this.internalIndex = 0;
    }

    getCollection() {
        return this.collection;
    }

    add(inputNode, regEx) {
        this.internalIndex++;
        this.collection[this.internalIndex] = {
            node: inputNode,
            regex: regEx
        }
    }

    
}