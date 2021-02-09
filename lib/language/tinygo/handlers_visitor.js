"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterVisitor = exports.HandlersVisitor = void 0;
const widl_1 = require("../../widl");
const _1 = require(".");
const helpers_1 = require("./helpers");
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
            this.write(`type ${className} struct {\n`);
            context.config.handlerPreamble = true;
        }
        const operation = context.operation;
        this.write(`${_1.capitalize(operation.name.value)} func(`);
        if (operation.isUnary()) {
            this.write(_1.mapArg(operation.unaryOp()));
        }
        else {
            this.write(_1.mapArgs(operation.arguments));
        }
        this.write(`)`);
        if (!helpers_1.isVoid(operation.type)) {
            this.write(` (${_1.expandType(operation.type, undefined, true, _1.isReference(operation.annotations))}, error)`);
        }
        else {
            this.write(` error`);
        }
        this.write(`\n`);
        super.triggerOperation(context);
    }
    visitAllOperationsAfter(context) {
        if (context.config.handlerPreamble == true) {
            this.write(`}\n\n`);
        }
        super.triggerAllOperationsAfter(context);
    }
}
exports.HandlersVisitor = HandlersVisitor;
class RegisterVisitor extends widl_1.BaseVisitor {
    constructor(writer) {
        super(writer);
    }
    visitAllOperationsBefore(context) {
        super.triggerAllOperationsBefore(context);
        if (context.config.handlerPreamble == true) {
            const className = context.config.handlersClassName || "Handlers";
            this.write(`func (h ${className}) Register() {\n`);
        }
    }
    visitOperation(context) {
        if (!utils_1.shouldIncludeHandler(context)) {
            return;
        }
        const operation = context.operation;
        this.write(`if h.${_1.capitalize(operation.name.value)} != nil {
      ${_1.uncapitalize(operation.name.value)}Handler = h.${_1.capitalize(operation.name.value)}
      wapc.RegisterFunction(${helpers_1.strQuote(operation.name.value)}, ${_1.uncapitalize(operation.name.value)}Wrapper)
    }\n`);
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
exports.RegisterVisitor = RegisterVisitor;
