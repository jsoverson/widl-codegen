"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleVisitor = void 0;
const widl_1 = require("../../widl");
const _1 = require(".");
class ModuleVisitor extends widl_1.BaseVisitor {
    constructor(writer) {
        super(writer);
        this.setCallback("AllOperationsBefore", "host", (context) => {
            const host = new _1.HostVisitor(writer);
            context.document.accept(context, host);
        });
        this.setCallback("AllOperationsBefore", "handlers", (context) => {
            const handlers = new _1.HandlersVisitor(this.writer);
            context.document.accept(context, handlers);
            const register = new _1.RegisterVisitor(this.writer);
            context.document.accept(context, register);
        });
        this.setCallback("AllOperationsBefore", "wrappers", (context) => {
            const wrapperVars = new _1.WrapperVarsVisitor(this.writer);
            context.document.accept(context, wrapperVars);
            const wrapperFuncs = new _1.WrapperFuncsVisitor(this.writer);
            context.document.accept(context, wrapperFuncs);
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
        const packageName = context.config["package"] || "module";
        this.write(`package ${packageName}\n`);
        this.write(`\n`);
        this.write(`import (\n`);
        this.write(`\twapc "github.com/wapc/wapc-guest-tinygo"\n`);
        this.write(`\tmsgpack "github.com/wapc/tinygo-msgpack"\n`);
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
