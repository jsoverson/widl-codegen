"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleVisitor = void 0;
const widl_1 = require("../../widl");
const _1 = require(".");
class ModuleVisitor extends _1.ClassVisitor {
    constructor(writer) {
        super(writer);
        this.setCallback("Interface", "host", (context) => {
            const host = new _1.HostVisitor(writer);
            context.interface.accept(context, host);
        });
        this.setCallback("Interface", "handlers", (context) => {
            const handlers = new _1.HandlersVisitor(this.writer);
            context.interface.accept(context, handlers);
        });
        this.setCallback("Interface", "wrappers", (context) => {
            const wrappers = new _1.WrappersVisitor(this.writer);
            context.interface.accept(context, wrappers);
        });
    }
    visitDocumentBefore(context) {
        this.write(`import { register, hostCall } from "@wapc/as-guest";
import { Decoder, Writer, Encoder, Sizer, Codec } from "@wapc/as-msgpack";\n`);
        super.triggerDocumentBefore(context);
    }
    visitInterface(context) {
        this.write(`\n`);
        super.triggerInterface(context);
    }
    visitOperation(context) {
        if (context.operation.isUnary()) {
            return;
        }
        const argObject = this.convertOperationToObject(context.operation);
        const args = new _1.ClassVisitor(this.writer);
        argObject.accept(context.clone({ object: argObject }), args);
        super.triggerOperation(context);
    }
    convertOperationToObject(operation) {
        var fields = operation.arguments.map((arg) => {
            return new widl_1.FieldDefinition(arg.loc, arg.name, arg.description, arg.type, arg.default, arg.annotations);
        });
        return new widl_1.ObjectDefinition(operation.loc, new widl_1.Name(operation.name.loc, _1.capitalize(operation.name.value) + "Args"), undefined, [], operation.annotations, fields);
    }
    visitObjectFieldsAfter(context) {
        var object = context.object;
        super.visitObjectFieldsAfter(context);
        this.write(`\n`);
        this.write(`  static newBuilder(): ${object.name.value}Builder {
      return new ${object.name.value}Builder();
    }\n`);
        super.triggerObjectFieldsAfter(context);
    }
    visitObjectAfter(context) {
        this.write(`}\n\n`);
        const builder = new _1.BuilderVisitor(this.writer);
        context.object.accept(context, builder);
        super.triggerObjectAfter(context);
    }
}
exports.ModuleVisitor = ModuleVisitor;
