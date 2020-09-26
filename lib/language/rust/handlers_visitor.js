"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterVisitor = exports.HandlersVisitor = void 0;
const widl_1 = require("../../widl");
const _1 = require(".");
const helpers_1 = require("./helpers");
class HandlersVisitor extends widl_1.BaseVisitor {
    constructor(writer) {
        super(writer);
    }
    visitInterfaceBefore(context) {
        super.triggerInterfaceBefore(context);
        this.write(`pub struct Handlers {}

impl Handlers {\n`);
    }
    visitOperation(context) {
        const operation = context.operation;
        this.write(`pub fn register_${helpers_1.functionName(operation.name.value)}(f: fn(`);
        operation.arguments.forEach((arg, i) => {
            if (i > 0) {
                this.write(`, `);
            }
            this.write(_1.expandType(arg.type, undefined, true, _1.isReference(arg.annotations)));
        });
        this.write(`) -> HandlerResult<`);
        if (!helpers_1.isVoid(operation.type)) {
            this.write(`${_1.expandType(operation.type, undefined, true, _1.isReference(operation.annotations))}`);
        }
        else {
            this.write(`()`);
        }
        this.write(`>) {
        *${helpers_1.functionName(operation.name.value).toUpperCase()}.write().unwrap() = Some(f);
        register_function(&"${operation.name.value}", ${helpers_1.functionName(operation.name.value)}_wrapper);
    }\n`);
        super.triggerOperation(context);
    }
    visitInterfaceAfter(context) {
        this.write(`}\n\n`);
        super.triggerInterfaceAfter(context);
    }
}
exports.HandlersVisitor = HandlersVisitor;
class RegisterVisitor extends widl_1.BaseVisitor {
    constructor(writer) {
        super(writer);
    }
    visitInterfaceBefore(context) {
        super.triggerInterfaceBefore(context);
        this.write(`func (h Handlers) Register() {\n`);
    }
    visitOperation(context) {
        const operation = context.operation;
        this.write(`if h.${_1.capitalize(operation.name.value)} != nil {
      ${operation.name.value}Handler = h.${_1.capitalize(operation.name.value)}
      wapc.RegisterFunction(${helpers_1.strQuote(operation.name.value)}, ${operation.name.value}Wrapper)
    }\n`);
        super.triggerOperation(context);
    }
    visitInterfaceAfter(context) {
        this.write(`}\n\n`);
        super.triggerInterfaceAfter(context);
    }
}
exports.RegisterVisitor = RegisterVisitor;
