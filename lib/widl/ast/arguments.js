"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Argument = void 0;
const kinds_1 = require("./kinds");
const node_1 = require("./node");
// Argument implements Node
class Argument extends node_1.AbstractNode {
    constructor(loc, name, value) {
        super(kinds_1.kinds.Argument, loc);
        this.name = name || undefined;
        this.value = value || undefined;
    }
}
exports.Argument = Argument;
