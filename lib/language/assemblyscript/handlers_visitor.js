"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandlersVisitor = void 0;
const widl_1 = require("../../widl");
const _1 = require(".");
class HandlersVisitor extends widl_1.BaseVisitor {
    constructor(writer) {
        super(writer);
    }
    visitInterfaceBefore(context) {
        super.triggerInterfaceBefore(context);
        this.write(`export class Handlers {\n`);
    }
    visitOperation(context) {
        this.write(`\n`);
        const operation = context.operation;
        let opVal = "";
        opVal += `static register${_1.capitalize(operation.name.value)}(handler: (`;
        if (operation.isUnary()) {
            opVal += _1.mapArg(operation.unaryOp());
        }
        else {
            opVal += _1.mapArgs(operation.arguments);
        }
        opVal += `) => ${_1.expandType(operation.type, true, _1.isReference(operation.annotations))}): void {\n`;
        opVal += `${operation.name.value}Handler = handler;\n`;
        opVal += `register(${_1.strQuote(operation.name.value)}, ${operation.name.value}Wrapper);\n}\n`;
        this.write(opVal);
        super.triggerOperation(context);
    }
    visitInterfaceAfter(context) {
        this.write(`}\n\n`);
        super.triggerInterfaceAfter(context);
    }
}
exports.HandlersVisitor = HandlersVisitor;
