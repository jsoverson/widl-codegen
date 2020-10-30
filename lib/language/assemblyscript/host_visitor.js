"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HostVisitor = void 0;
const widl_1 = require("../../widl");
const _1 = require(".");
class HostVisitor extends widl_1.BaseVisitor {
    constructor(writer) {
        super(writer);
    }
    visitInterfaceBefore(context) {
        super.triggerInterfaceBefore(context);
        this.write(`export class Host {
      binding: string;
  
      constructor(binding: string) {
        this.binding = binding;
      }\n`);
    }
    visitOperation(context) {
        this.write(`\n`);
        const operation = context.operation;
        this.write(`  ${operation.name.value}(`);
        operation.arguments.map((arg, index) => {
            if (index > 0) {
                this.write(`, `);
            }
            this.write(`${arg.name.value}: ${_1.expandType(arg.type, false, false)}`);
        });
        this.write(`): ${_1.expandType(operation.type, false, false)} {\n`);
        this.write(`  `);
        const retVoid = _1.isVoid(operation.type);
        if (operation.isUnary()) {
            if (!retVoid) {
                this.write(`const payload = `);
            }
            this.write(`hostCall(this.binding, ${_1.strQuote(context.namespace.name.value)}, ${_1.strQuote(operation.name.value)}, ${operation.unaryOp().name.value}.toBuffer());\n`);
        }
        else {
            this.write(`const inputArgs = new ${_1.capitalize(operation.name.value)}Args();\n`);
            operation.arguments.map((arg) => {
                const argName = arg.name.value;
                this.write(`  inputArgs.${argName} = ${argName};\n`);
            });
            if (!retVoid) {
                this.write(`const payload = `);
            }
            this.write(`hostCall(
      this.binding,
      ${_1.strQuote(context.namespace.name.value)},
      ${_1.strQuote(operation.name.value)},
      inputArgs.toBuffer()
    );\n`);
        }
        if (!retVoid) {
            this.write(`    const decoder = new Decoder(payload);\n`);
            if (_1.isObject(operation.type)) {
                this.write(`    return ${_1.expandType(operation.type, false, _1.isReference(operation.annotations))}.decode(decoder);\n`);
            }
            else {
                this.write(`    const ${_1.read("ret", operation.type, false, _1.isReference(operation.annotations))}`);
                this.write(`    return ret;\n`);
            }
        }
        this.write(`  }\n`);
        super.triggerOperation(context);
    }
    visitInterfaceAfter(context) {
        this.write(`}\n\n`);
        super.triggerInterfaceAfter(context);
    }
}
exports.HostVisitor = HostVisitor;
