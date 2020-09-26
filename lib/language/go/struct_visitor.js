"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructVisitor = void 0;
const widl_1 = require("../../widl");
const _1 = require(".");
class StructVisitor extends widl_1.BaseVisitor {
    constructor(writer) {
        super(writer);
    }
    visitObjectBefore(context) {
        super.triggerObjectBefore(context);
        this.write(`type ${context.object.name.value} struct {\n`);
    }
    visitObjectField(context) {
        const field = context.field;
        this.write(`\t${_1.fieldName(field.name.value)} ${_1.expandType(field.type, undefined, true, _1.isReference(field.annotations))} \`msgpack:"${field.name.value}"\`\n`);
        super.triggerObjectField(context);
    }
    visitObjectAfter(context) {
        this.write(`}\n\n`);
        super.triggerObjectAfter(context);
    }
}
exports.StructVisitor = StructVisitor;
