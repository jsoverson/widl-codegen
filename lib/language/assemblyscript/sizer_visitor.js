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
        this.write(`  size(sizer: Sizer): void {
        sizer.writeMapSize(${context.fields.length});\n`);
        super.triggerObjectFieldsBefore(context);
    }
    visitObjectField(context) {
        const field = context.field;
        this.write(`sizer.writeString(${_1.strQuote(field.name.value)});\n`);
        this.write(_1.size("this." + field.name.value, field.type, _1.isReference(field.annotations)));
        super.triggerObjectField(context);
    }
    visitObjectFieldsAfter(context) {
        this.write(`  }\n`);
        super.triggerObjectFieldsAfter(context);
    }
}
exports.SizerVisitor = SizerVisitor;
