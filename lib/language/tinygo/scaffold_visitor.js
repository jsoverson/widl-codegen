"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScaffoldVisitor = void 0;
const widl_1 = require("../../widl");
const _1 = require(".");
const utils_1 = require("../utils");
class ScaffoldVisitor extends widl_1.BaseVisitor {
    constructor(writer) {
        super(writer);
    }
    visitDocumentBefore(context) {
        const importPath = context.config["import"] || "github.com/myorg/mymodule/pkg/module";
        super.visitDocumentBefore(context);
        this.write(`package main

    import (
      "${importPath}"
    )\n\n`);
    }
    visitAllOperationsBefore(context) {
        this.write(`\n`);
        const registration = new HandlerRegistrationVisitor(this.writer);
        context.document.accept(context, registration);
    }
    visitOperation(context) {
        if (!utils_1.shouldIncludeHandler(context)) {
            return;
        }
        const packageName = context.config["package"] || "module";
        const operation = context.operation;
        this.write(`\n`);
        this.write(`func ${operation.name.value}(${_1.mapArgs(operation.arguments, packageName)})`);
        if (!_1.isVoid(operation.type)) {
            this.write(` (${_1.expandType(operation.type, packageName, true, _1.isReference(operation.annotations))}, error)`);
        }
        else {
            this.write(` error`);
        }
        this.write(` {\n`);
        if (!_1.isVoid(operation.type)) {
            const dv = _1.defaultValueForType(operation.type, packageName);
            this.write(`  return ${dv}, nil`);
        }
        else {
            this.write(`  return nil`);
        }
        this.write(` // TODO: Provide implementation.\n`);
        this.write(`}\n`);
    }
}
exports.ScaffoldVisitor = ScaffoldVisitor;
class HandlerRegistrationVisitor extends widl_1.BaseVisitor {
    constructor(writer) {
        super(writer);
    }
    visitInterfaceBefore(context) {
        this.write(`func main() {
      module.Handlers{\n`);
    }
    visitOperation(context) {
        const operation = context.operation;
        this.write(`\t\t${_1.capitalize(operation.name.value)}: ${operation.name.value},\n`);
    }
    visitInterfaceAfter(context) {
        this.write(`}.Register()
  }\n`);
    }
}
