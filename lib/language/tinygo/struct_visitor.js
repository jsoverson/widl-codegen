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
        this.write(`\t${_1.fieldName(field.name.value)} ${_1.expandType(field.type, undefined, true, _1.isReference(field.annotations))}\n`);
        super.triggerObjectField(context);
    }
    visitObjectAfter(context) {
        this.write(`}\n\n`);
        super.triggerObjectAfter(context);
        const object = context.object;
        const decoder = new _1.DecoderVisitor(this.writer);
        object.accept(context, decoder);
        const sizer = new _1.SizerVisitor(this.writer);
        object.accept(context, sizer);
        const encoder = new _1.EncoderVisitor(this.writer);
        object.accept(context, encoder);
        this.write(`func (o *${object.name.value}) ToBuffer() []byte {
      var sizer msgpack.Sizer
      o.Size(&sizer)
      buffer := make([]byte, sizer.Len())
      encoder := msgpack.NewEncoder(buffer)
      o.Encode(&encoder)
      return buffer
    }\n\n`);
    }
}
exports.StructVisitor = StructVisitor;
