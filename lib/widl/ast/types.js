"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Optional = exports.Map = exports.List = exports.Named = void 0;
const node_1 = require("./node");
const kinds_1 = require("./kinds");
class Named extends node_1.AbstractNode {
    constructor(loc, name) {
        super(kinds_1.kinds.Named, loc);
        this.Name = name;
    }
    string() {
        return this.getKind();
    }
}
exports.Named = Named;
class List extends node_1.AbstractNode {
    constructor(loc, type) {
        super(kinds_1.kinds.List, loc);
        this.type = type || null;
    }
    string() {
        return this.getKind();
    }
}
exports.List = List;
class Map extends node_1.AbstractNode {
    constructor(loc, keyType, valueType) {
        super(kinds_1.kinds.Map, loc);
        this.keyType = keyType || null;
        this.valueType = valueType || null;
    }
    string() {
        return this.getKind();
    }
}
exports.Map = Map;
class Optional extends node_1.AbstractNode {
    constructor(loc, type) {
        super(kinds_1.kinds.Optional, loc);
        this.type = type || null;
    }
    string() {
        return this.getKind();
    }
}
exports.Optional = Optional;
