"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecoderVisitor = void 0;
const widl_1 = require("../../widl");
const _1 = require(".");
class DecoderVisitor extends widl_1.BaseVisitor {
    constructor(writer) {
        super(writer);
    }
    visitObjectFieldsBefore(context) {
        super.triggerObjectFieldsBefore(context);
        this.write(`    static decodeNullable(decoder: Decoder): ${context.object.name.value} | null {
    if (decoder.isNextNil()) return null;
    return ${context.object.name.value}.decode(decoder);
  }

  // decode
  static decode(decoder: Decoder): ${context.object.name.value} {
    const o = new ${context.object.name.value}();
    o.decode(decoder);
    return o;
  }
    
  decode(decoder: Decoder): void {
    var numFields = decoder.readMapSize();

    while (numFields > 0) {
      numFields--;
      const field = decoder.readString();\n\n`);
    }
    visitObjectField(context) {
        const field = context.field;
        this.write(`      `);
        if (context.fieldIndex > 0) {
            this.write(`} else `);
        }
        this.write(`if (field == "${field.name.value}") {\n`);
        this.write(_1.read(`this.${field.name.value}`, field.type, false, _1.isReference(field.annotations)));
        super.triggerObjectField(context);
    }
    visitObjectFieldsAfter(context) {
        if (context.fields.length > 0) {
            this.write(`      } else {
        decoder.skip();
      }\n`);
        }
        this.write(`    }\n`);
        this.write(`  }\n`);
        super.triggerObjectFieldsAfter(context);
    }
}
exports.DecoderVisitor = DecoderVisitor;
