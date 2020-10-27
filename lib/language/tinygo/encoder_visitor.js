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
        this.write(`func (o *${_1.capitalize(context.object.name.value)}) Encode(encoder msgpack.Writer) error {
    if o == nil {
      encoder.WriteNil()
      return nil
    }
    encoder.WriteMapSize(${context.fields.length})\n`);
    }
    visitObjectField(context) {
        const field = context.field;
        this.write(`encoder.WriteString(${_1.strQuote(field.name.value)})\n`);
        this.write(_1.encode("o." + _1.fieldName(field.name.value), field.type, _1.isReference(field.annotations)));
        super.triggerObjectField(context);
    }
    visitObjectFieldsAfter(context) {
        this.write(`return nil
  }\n\n`);
        super.triggerObjectFieldsAfter(context);
    }
}
exports.EncoderVisitor = EncoderVisitor;
