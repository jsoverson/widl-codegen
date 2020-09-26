"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuilderVisitor = void 0;
const widl_1 = require("../../widl");
const _1 = require(".");
class BuilderVisitor extends widl_1.BaseVisitor {
    constructor(writer) {
        super(writer);
    }
    visitObjectBefore(context) {
        super.triggerObjectBefore(context);
        const className = context.object.name.value;
        this.write(`export class ${className}Builder {
  instance: ${className} = new ${className}();\n`);
    }
    visitObjectField(context) {
        const className = context.object.name.value;
        const field = context.field;
        this.write(`\n`);
        this.write(`with${_1.capitalize(field.name.value)}(${field.name.value}: ${_1.expandType(field.type, true, _1.isReference(field.annotations))}): ${className}Builder {
    this.instance.${field.name.value} = ${field.name.value};
    return this;
  }\n`);
        super.triggerObjectField(context);
    }
    visitObjectFieldsAfter(context) {
        this.write(`\n`);
        this.write(`  build(): ${context.object.name.value} {
      return this.instance;
    }`);
        super.triggerObjectFieldsAfter(context);
    }
    visitObjectAfter(context) {
        this.write(`}\n\n`);
        super.triggerObjectAfter(context);
    }
}
exports.BuilderVisitor = BuilderVisitor;
