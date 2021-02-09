"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructVisitor = void 0;
const widl_1 = require("../../widl");
const _1 = require(".");
const utils_1 = require("../utils");
class StructVisitor extends widl_1.BaseVisitor {
    constructor(writer) {
        super(writer);
    }
    visitObjectBefore(context) {
        super.triggerObjectBefore(context);
        this.write(utils_1.formatComment("    // ", context.object.description));
        this.write(`type ${context.object.name.value} struct {\n`);
    }
    visitObjectField(context) {
        const field = context.field;
        this.write(utils_1.formatComment("    // ", field.description));
        this.write(`\t${_1.fieldName(field.name.value)} ${_1.expandType(field.type, undefined, true, _1.isReference(field.annotations))}\n`);
        super.triggerObjectField(context);
    }
    visitObjectAfter(context) {
        this.write(`}\n\n`);
        super.triggerObjectAfter(context);
        const object = context.object;
        const decoder = new _1.DecoderVisitor(this.writer);
        object.accept(context, decoder);
        const encoder = new _1.EncoderVisitor(this.writer);
        object.accept(context, encoder);
        this.write(`\n`);
    }
}
exports.StructVisitor = StructVisitor;
