"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Name = void 0;
const kinds_1 = require("./kinds");
const node_1 = require("./node");
// Name implements Node
class Name extends node_1.AbstractNode {
    constructor(doc, value) {
        super(kinds_1.kinds.Name, doc);
        this.value = value || "";
    }
}
exports.Name = Name;
