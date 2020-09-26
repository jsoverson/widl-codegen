"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Annotation = void 0;
const kinds_1 = require("./kinds");
const node_1 = require("./node");
// Annotation implements Node
class Annotation extends node_1.AbstractNode {
    constructor(loc, name, args) {
        super(kinds_1.kinds.Annotation, loc);
        this.name = name;
        this.arguments = args || [];
    }
}
exports.Annotation = Annotation;
