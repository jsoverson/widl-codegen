"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SizerVisitor = void 0;
const widl_1 = require("../../widl");
const _1 = require(".");
class SizerVisitor extends widl_1.BaseVisitor {
    constructor(writer) {
        super(writer);
    }
    visitObjectFieldsBefore(context) {
        this.write(`func (o *${_1.capitalize(context.object.name.value)}) Size(sizer *msgpack.Sizer) {
        if o == nil {
          sizer.WriteNil()
          return
        }
        sizer.WriteMapSize(${context.fields.length})\n`);
        super.triggerObjectFieldsBefore(context);
    }
    visitObjectField(context) {
        const field = context.field;
        this.write(`sizer.WriteString(${_1.strQuote(field.name.value)})\n`);
        this.write(_1.size("o." + _1.fieldName(field.name.value), field.type, _1.isReference(field.annotations)));
        super.triggerObjectField(context);
    }
    visitObjectFieldsAfter(context) {
        this.write(`}\n\n`);
        super.triggerObjectFieldsAfter(context);
    }
}
exports.SizerVisitor = SizerVisitor;
