"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WrappersVisitor = void 0;
const widl_1 = require("../../widl");
const _1 = require(".");
class WrappersVisitor extends widl_1.BaseVisitor {
    constructor(writer) {
        super(writer);
    }
    visitOperation(context) {
        const operation = context.operation;
        this.write(`var ${operation.name.value}Handler: (${_1.mapArgs(operation.arguments)}) => ${_1.expandType(operation.type, true, _1.isReference(operation.annotations))};\n`);
        this
            .write(`function ${operation.name.value}Wrapper(payload: ArrayBuffer): ArrayBuffer {
      const decoder = new Decoder(payload)\n`);
        if (operation.isUnary()) {
            this.write(`const request = new ${_1.expandType(operation.unaryOp().type, false, _1.isReference(operation.annotations))}();
      request.decode(decoder);\n`);
            this.write(_1.isVoid(operation.type) ? "" : "const response = ");
            this.write(`${operation.name.value}Handler(request);\n`);
        }
        else {
            this.write(`const inputArgs = new ${_1.capitalize(operation.name.value)}Args();
      inputArgs.decode(decoder);\n`);
            this.write(_1.isVoid(operation.type) ? "" : "const response = ");
            this.write(`${operation.name.value}Handler(${_1.varAccessArg("inputArgs", operation.arguments)});\n`);
        }
        if (_1.isVoid(operation.type)) {
            this.visitWrapperBeforeReturn(context);
            this.write(`return new ArrayBuffer(0);\n`);
        }
        else if (_1.isObject(operation.type)) {
            this.visitWrapperBeforeReturn(context);
            this.write(`return response.toBuffer();\n`);
        }
        else {
            this.write(`const sizer = new Sizer();\n`);
            this.write(_1.encode("response", operation.type, _1.isReference(operation.annotations)));
            this.write(`const ua = new ArrayBuffer(sizer.length);
      const encoder = new Encoder(ua);
      ${_1.encode("response", operation.type, _1.isReference(operation.annotations))};\n`);
            this.visitWrapperBeforeReturn(context);
            this.write(`return ua;\n`);
        }
        this.write(`}\n\n`);
    }
    visitWrapperBeforeReturn(context) {
        this.triggerCallbacks(context, "WrapperBeforeReturn");
    }
}
exports.WrappersVisitor = WrappersVisitor;
