"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WrapperFuncsVisitor = exports.WrapperVarsVisitor = void 0;
const widl_1 = require("../../widl");
const _1 = require(".");
const utils_1 = require("../utils");
class WrapperVarsVisitor extends widl_1.BaseVisitor {
    constructor(writer) {
        super(writer);
    }
    visitOperation(context) {
        if (!utils_1.shouldIncludeHandler(context)) {
            return;
        }
        if (context.config.handlerPreamble != true) {
            this.write(`var (\n`);
            context.config.handlerPreamble = true;
        }
        const operation = context.operation;
        this.write(`\t${_1.uncapitalize(operation.name.value)}Handler func (${_1.mapArgs(operation.arguments)}) `);
        if (!_1.isVoid(operation.type)) {
            this.write(`(${_1.expandType(operation.type, undefined, true, _1.isReference(operation.annotations))}, error)`);
        }
        else {
            this.write(`error`);
        }
        this.write(`\n`);
    }
    visitAllOperationsAfter(context) {
        if (context.config.handlerPreamble == true) {
            this.write(`)\n\n`);
            delete context.config.handlerPreamble;
        }
        super.triggerAllOperationsAfter(context);
    }
}
exports.WrapperVarsVisitor = WrapperVarsVisitor;
class WrapperFuncsVisitor extends widl_1.BaseVisitor {
    constructor(writer) {
        super(writer);
    }
    visitOperation(context) {
        if (!utils_1.shouldIncludeHandler(context)) {
            return;
        }
        const operation = context.operation;
        this.write(`func ${_1.uncapitalize(operation.name.value)}Wrapper(payload []byte) ([]byte, error) {
      decoder := msgpack.NewDecoder(payload)\n`);
        if (operation.isUnary()) {
            this.write(`var request ${_1.expandType(operation.unaryOp().type, undefined, false, _1.isReference(operation.annotations))}
      request.Decode(&decoder)\n`);
            this.write(_1.isVoid(operation.type) ? "err := " : "response, err := ");
            this.write(`${_1.uncapitalize(operation.name.value)}Handler(request)\n`);
        }
        else {
            this.write(`var inputArgs ${_1.capitalize(operation.name.value)}Args
      inputArgs.Decode(&decoder)\n`);
            this.write(_1.isVoid(operation.type) ? "err := " : "response, err := ");
            this.write(`${_1.uncapitalize(operation.name.value)}Handler(${_1.varAccessArg("inputArgs", operation.arguments)})\n`);
        }
        this.write(`if err != nil {
      return nil, err
    }\n`);
        if (_1.isVoid(operation.type)) {
            this.visitWrapperBeforeReturn(context);
            this.write(`return []byte{}, nil\n`);
        }
        else if (_1.isObject(operation.type)) {
            this.visitWrapperBeforeReturn(context);
            this.write(`return msgpack.ToBytes(&response)\n`);
        }
        else {
            this.write(`var sizer msgpack.Sizer
      ${_1.size(true, "response", operation.type, _1.isReference(operation.annotations))}
      ua := make([]byte, sizer.Len());
      encoder := msgpack.NewEncoder(ua);
      ${_1.encode(true, "response", operation.type, _1.isReference(operation.annotations))}\n`);
            this.visitWrapperBeforeReturn(context);
            this.write(`return ua, nil\n`);
        }
        this.write(`}\n\n`);
    }
    visitWrapperBeforeReturn(context) {
        this.triggerCallbacks(context, "WrapperBeforeReturn");
    }
}
exports.WrapperFuncsVisitor = WrapperFuncsVisitor;
