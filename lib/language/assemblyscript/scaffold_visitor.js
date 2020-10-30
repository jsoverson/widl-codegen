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
        var _a;
        const packageName = context.config["package"] || "./module";
        super.visitDocumentBefore(context);
        this.write(`import { handleCall, handleAbort } from "@wapc/as-guest";\n`);
        this.write(`import { `);
        const types = new TypesVisitor(this.writer);
        (_a = context.document) === null || _a === void 0 ? void 0 : _a.accept(context, types);
        this.write(`Handlers } from "${packageName}";\n`);
    }
    visitInterface(context) {
        this.write(`\n`);
        const registration = new HandlerRegistrationVisitor(this.writer);
        context.interface.accept(context, registration);
    }
    visitOperation(context) {
        const operation = context.operation;
        this.write(`\n`);
        this.write(`function ${operation.name.value}(${_1.mapArgs(operation.arguments)}): ${_1.expandType(operation.type, true, _1.isReference(operation.annotations))} {\n`);
        if (!_1.isVoid(operation.type)) {
            const dv = _1.defaultValueForType(operation.type);
            this.write(`  return ${dv};`);
        }
        this.write(`// TODO: Provide implementation.\n`);
        this.write(`}\n`);
    }
    visitDocumentAfter(context) {
        this.write(`\n`);
        this.write(`// Boilerplate code for waPC.  Do not remove.\n\n`);
        this
            .write(`export function __guest_call(operation_size: usize, payload_size: usize): bool {
  return handleCall(operation_size, payload_size);
}

// Abort function
function abort(
  message: string | null,
  fileName: string | null,
  lineNumber: u32,
  columnNumber: u32
): void {
  handleAbort(message, fileName, lineNumber, columnNumber);
}\n`);
    }
}
exports.ScaffoldVisitor = ScaffoldVisitor;
class HandlerRegistrationVisitor extends widl_1.BaseVisitor {
    constructor(writer) {
        super(writer);
    }
    visitInterfaceBefore(context) {
        this.write(`export function wapc_init(): void {\n`);
    }
    visitOperation(context) {
        const operation = context.operation;
        this.write(`  Handlers.register${_1.capitalize(operation.name.value)}(${operation.name.value});\n`);
    }
    visitInterfaceAfter(context) {
        this.write(`}\n`);
    }
}
class TypesVisitor extends widl_1.BaseVisitor {
    visitObject(context) {
        this.write(`${context.object.name.value}, `);
    }
}
