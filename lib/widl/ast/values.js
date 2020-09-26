"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectField = exports.ObjectValue = exports.MapValue = exports.ListValue = exports.EnumValue = exports.BooleanValue = exports.StringValue = exports.FloatValue = exports.IntValue = exports.Variable = void 0;
const node_1 = require("./node");
const kinds_1 = require("./kinds");
class Variable extends node_1.AbstractNode {
    constructor(loc, name) {
        super(kinds_1.kinds.Variable, loc);
        this.name = name;
    }
    getValue() {
        return this.GetName();
    }
    GetName() {
        return this.name;
    }
}
exports.Variable = Variable;
class IntValue extends node_1.AbstractNode {
    constructor(loc, value) {
        super(kinds_1.kinds.IntValue, loc);
        this.value = value;
    }
    getValue() {
        return this.value;
    }
}
exports.IntValue = IntValue;
class FloatValue extends node_1.AbstractNode {
    constructor(loc, value) {
        super(kinds_1.kinds.FloatValue, loc);
        this.value = value;
    }
    getValue() {
        return this.value;
    }
}
exports.FloatValue = FloatValue;
class StringValue extends node_1.AbstractNode {
    constructor(loc, value) {
        super(kinds_1.kinds.StringValue, loc);
        this.value = value;
    }
    getValue() {
        return this.value;
    }
}
exports.StringValue = StringValue;
class BooleanValue extends node_1.AbstractNode {
    constructor(loc, value) {
        super(kinds_1.kinds.BooleanValue, loc);
        this.value = value;
    }
    getValue() {
        return this.value;
    }
}
exports.BooleanValue = BooleanValue;
class EnumValue extends node_1.AbstractNode {
    constructor(loc, value) {
        super(kinds_1.kinds.EnumValue, loc);
        this.value = value;
    }
    getValue() {
        return this.value;
    }
}
exports.EnumValue = EnumValue;
class ListValue extends node_1.AbstractNode {
    constructor(loc, value) {
        super(kinds_1.kinds.ListValue, loc);
        this.value = value || null;
    }
    getValue() {
        return this.value;
    }
}
exports.ListValue = ListValue;
class MapValue extends node_1.AbstractNode {
    constructor(loc, value) {
        super(kinds_1.kinds.MapValue, loc);
        this.value = value || null;
    }
    getValue() {
        return this.value;
    }
}
exports.MapValue = MapValue;
class ObjectValue extends node_1.AbstractNode {
    constructor(loc, fields) {
        super(kinds_1.kinds.ObjectValue, loc);
        this.fields = fields || null;
    }
    getValue() {
        return this.fields;
    }
}
exports.ObjectValue = ObjectValue;
class ObjectField extends node_1.AbstractNode {
    constructor(loc, value, name) {
        super(kinds_1.kinds.ObjectField, loc);
        this.value = value || null;
        this.name = name || null;
    }
    getValue() {
        return this.value;
    }
}
exports.ObjectField = ObjectField;
