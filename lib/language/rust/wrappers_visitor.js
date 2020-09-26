"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WrapperFuncsVisitor = exports.WrapperVarsVisitor = void 0;
const widl_1 = require("../../widl");
const _1 = require(".");
class WrapperVarsVisitor extends widl_1.BaseVisitor {
    constructor(writer) {
        super(writer);
    }
    visitInterfaceBefore(context) {
        this.write(`lazy_static! {\n`);
    }
    visitOperation(context) {
        const operation = context.operation;
        this.write(`static ref ${_1.functionName(operation.name.value).toUpperCase()}: RwLock<Option<fn(`);
        operation.arguments.forEach((arg, i) => {
            if (i > 0) {
                this.write(`, `);
            }
            this.write(_1.expandType(arg.type, undefined, true, _1.isReference(arg.annotations)));
        });
        this.write(`) -> HandlerResult<`);
        if (!_1.isVoid(operation.type)) {
            this.write(`${_1.expandType(operation.type, undefined, true, _1.isReference(operation.annotations))}`);
        }
        else {
            this.write(`()`);
        }
        this.write(`>>> = RwLock::new(None);\n`);
    }
    visitInterfaceAfter(context) {
        this.write(`}\n\n`);
    }
}
exports.WrapperVarsVisitor = WrapperVarsVisitor;
class WrapperFuncsVisitor extends widl_1.BaseVisitor {
    constructor(writer) {
        super(writer);
    }
    visitOperation(context) {
        const operation = context.operation;
        this.write(`fn ${_1.functionName(operation.name.value)}_wrapper(input_payload: &[u8]) -> CallResult {\n`);
        if (operation.isUnary()) {
            this.write(`let input = deserialize::<${_1.expandType(operation.unaryOp().type, undefined, false, _1.isReference(operation.annotations))}>(input_payload)?;
      let lock = ${_1.functionName(operation.name.value).toUpperCase()}.read().unwrap().unwrap();
      let result = lock(input)?;\n`);
        }
        else {
            this.write(`let input = deserialize::<${_1.capitalize(operation.name.value)}Args>(input_payload)?;
      let lock = ${_1.functionName(operation.name.value).toUpperCase()}.read().unwrap().unwrap();\n`);
            this.write(`let result = lock(${_1.varAccessArg("input", operation.arguments)})?;\n`);
        }
        this.write(`Ok(serialize(result)?)\n`);
        this.write(`}\n\n`);
    }
    visitWrapperBeforeReturn(context) {
        this.triggerCallbacks(context, "WrapperBeforeReturn");
    }
}
exports.WrapperFuncsVisitor = WrapperFuncsVisitor;
