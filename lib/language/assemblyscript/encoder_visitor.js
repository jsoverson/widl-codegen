"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EncoderVisitor = void 0;
const widl_1 = require("../../widl");
const _1 = require(".");
class EncoderVisitor extends widl_1.BaseVisitor {
    constructor(writer) {
        super(writer);
    }
    visitObjectFieldsBefore(context) {
        super.triggerObjectFieldsBefore(context);
        this.write(`  encode(encoder: Encoder): void {
    encoder.writeMapSize(${context.fields.length});\n`);
    }
    visitObjectField(context) {
        const field = context.field;
        this.write(`encoder.writeString(${_1.strQuote(field.name.value)});\n`);
        this.write(_1.encode("this." + field.name.value, field.type, _1.isReference(field.annotations)));
        super.triggerObjectField(context);
    }
    visitObjectFieldsAfter(context) {
        this.write(`  }\n`);
        super.triggerObjectFieldsAfter(context);
    }
}
exports.EncoderVisitor = EncoderVisitor;
