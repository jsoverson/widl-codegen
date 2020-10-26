"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassVisitor = void 0;
const widl_1 = require("../../widl");
const _1 = require(".");
class ClassVisitor extends widl_1.BaseVisitor {
    constructor(writer) {
        super(writer);
    }
    visitObjectBefore(context) {
        super.triggerObjectBefore(context);
        this.write(`export class ${context.object.name.value} {\n`);
    }
    visitObjectField(context) {
        const field = context.field;
        this.write(`  ${field.name.value}: ${_1.expandType(field.type, true, _1.isReference(field.annotations))} = ${_1.defValue(field)};\n`);
        super.triggerObjectField(context);
    }
    visitObjectFieldsAfter(context) {
        this.write(`\n`);
        const decoder = new _1.DecoderVisitor(this.writer);
        context.object.accept(context, decoder);
        this.write(`\n`);
        const encoder = new _1.EncoderVisitor(this.writer);
        context.object.accept(context, encoder);
        this.write(`\n`);
        this.write(`  toBuffer(): ArrayBuffer {
      let sizer = new Sizer();
      this.encode(sizer);
      let buffer = new ArrayBuffer(sizer.length);
      let encoder = new Encoder(buffer);
      this.encode(encoder);
      return buffer;
    }\n`);
        super.triggerObjectFieldsAfter(context);
    }
    visitObjectAfter(context) {
        this.write(`}\n\n`);
        super.triggerObjectAfter(context);
    }
}
exports.ClassVisitor = ClassVisitor;
