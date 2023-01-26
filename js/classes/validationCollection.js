export class validationCollection {
    
    constructor() {
        this.collection = {}
        this.internalIndex = 0;
    }

    getCollection() {
        return this.collection;
    }

    add(label, inputNode, regEx) {

        this.internalIndex++;
        this.collection[this.internalIndex] = {
            node: inputNode,
            regex: regEx,
            label: label
        };

        this.collection[label] = {
            node: inputNode,
            regex: regEx    
        }
    }

    
}