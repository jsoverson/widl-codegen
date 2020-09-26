"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractNode = void 0;
class AbstractNode {
    constructor(kind, loc) {
        this.kind = kind || "";
        this.loc = loc;
    }
    getKind() {
        return this.kind;
    }
    getLoc() {
        return this.loc;
    }
    accept(_context, _visitor) { }
}
exports.AbstractNode = AbstractNode;
