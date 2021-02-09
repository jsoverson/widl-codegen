"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandlersVisitor = void 0;
const widl_1 = require("../../widl");
const _1 = require(".");
const utils_1 = require("../utils");
class HandlersVisitor extends widl_1.BaseVisitor {
    constructor(writer) {
        super(writer);
    }
    visitOperation(context) {
        if (!utils_1.shouldIncludeHandler(context)) {
            return;
        }
        if (context.config.handlerPreamble != true) {
            const className = context.config.handlersClassName || "Handlers";
            this.write(`
      import { register } from "@wapc/as-guest";
      export class ${className} {\n`);
            context.config.handlerPreamble = true;
        }
        this.write(`\n`);
        const operation = context.operation;
        let opVal = "";
        this.write(utils_1.formatComment("  // ", operation.description));
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
    visitAllOperationsAfter(context) {
        if (context.config.handlerPreamble == true) {
            this.write(`}\n\n`);
            delete context.config.handlerPreamble;
        }
        super.triggerAllOperationsAfter(context);
    }
}
exports.HandlersVisitor = HandlersVisitor;
