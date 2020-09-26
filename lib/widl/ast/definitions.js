"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnnotationDefinition = void 0;
const node_1 = require("./node");
const kinds_1 = require("./kinds");
class AnnotationDefinition extends node_1.AbstractNode {
    constructor(loc, name, description, args, locations) {
        super(kinds_1.kinds.AnnotationDefinition, loc);
        this.name = name;
        this.description = description;
        this.arguments = args;
        this.locations = locations;
    }
    getDescription() {
        return this.description;
    }
}
exports.AnnotationDefinition = AnnotationDefinition;
