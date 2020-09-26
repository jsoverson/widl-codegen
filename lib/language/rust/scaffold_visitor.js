"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScaffoldVisitor = void 0;
const widl_1 = require("../../widl");
const _1 = require(".");
class ScaffoldVisitor extends widl_1.BaseVisitor {
    constructor(writer) {
        super(writer);
    }
    visitDocumentBefore(context) {
        const useName = context.config["use"] || "generated";
        super.visitDocumentBefore(context);
        this.write(`pub mod ${useName};
extern crate wapc_guest as guest;
use guest::prelude::*;
use ${useName}::*;\n\n`);
    }
    visitInterface(context) {
        const registration = new HandlerRegistrationVisitor(this.writer);
        context.interface.accept(context, registration);
    }
    visitOperation(context) {
        const operation = context.operation;
        this.write(`\n`);
        this.write(`fn ${_1.functionName(operation.name.value)}(${_1.mapArgs(operation.arguments, true)}) -> HandlerResult<`);
        if (!_1.isVoid(operation.type)) {
            this.write(_1.expandType(operation.type, undefined, true, _1.isReference(operation.annotations)));
        }
        else {
            this.write(`()`);
        }
        this.write(`> {\n`);
        if (!_1.isVoid(operation.type)) {
            const dv = _1.defaultValueForType(operation.type, undefined);
            this.write(`    Ok(${dv})`);
        }
        else {
            this.write(`    Ok(())`);
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
        this.write(`#[no_mangle]
pub fn wapc_init() {\n`);
    }
    visitOperation(context) {
        const operation = context.operation;
        this.write(`    Handlers::register_${_1.functionName(operation.name.value)}(${_1.functionName(operation.name.value)});\n`);
    }
    visitInterfaceAfter(context) {
        this.write(`}\n`);
    }
}
