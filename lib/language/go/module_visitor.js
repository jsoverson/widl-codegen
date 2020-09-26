"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleVisitor = void 0;
const widl_1 = require("../../widl");
const _1 = require(".");
class ModuleVisitor extends widl_1.BaseVisitor {
    constructor(writer) {
        super(writer);
        this.setCallback("Interface", "host", (context) => {
            const host = new _1.HostVisitor(writer);
            context.interface.accept(context, host);
        });
        this.setCallback("OperationAfter", "arguments", (context) => {
            if (context.operation.isUnary()) {
                return;
            }
            const argObject = this.convertOperationToObject(context.operation);
            const struct = new _1.StructVisitor(this.writer);
            argObject.accept(context.clone({ object: argObject }), struct);
        });
        this.setCallback("Object", "struct", (context) => {
            const struct = new _1.StructVisitor(this.writer);
            context.object.accept(context, struct);
        });
    }
    visitDocumentBefore(context) {
        this.write(`package module\n`);
        this.write(`\n`);
        this.write(`import (\n`);
        this.write(`"context"\n`);
        this.write(`\n`);
        this.write(`\t"github.com/wapc/wapc-go"\n`);
        this.write(`\t"github.com/vmihailenco/msgpack/v5"\n`);
        this.write(`)\n\n`);
        super.triggerDocumentBefore(context);
    }
    convertOperationToObject(operation) {
        var fields = operation.arguments.map((arg) => {
            return new widl_1.FieldDefinition(arg.loc, arg.name, arg.description, arg.type, arg.default, arg.annotations);
        });
        return new widl_1.ObjectDefinition(operation.loc, new widl_1.Name(operation.name.loc, _1.capitalize(operation.name.value) + "Args"), undefined, [], operation.annotations, fields);
    }
}
exports.ModuleVisitor = ModuleVisitor;
