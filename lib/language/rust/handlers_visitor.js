"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandlersVisitor = void 0;
const widl_1 = require("../../widl");
const _1 = require(".");
const helpers_1 = require("./helpers");
const utils_1 = require("../utils");
class HandlersVisitor extends widl_1.BaseVisitor {
    constructor(writer) {
        super(writer);
    }
    visitOperation(context) {
        if (!utils_1.shouldIncludeHandler(context)) {
            return;
        }
        if (context.config.handlerPreamble != true) {
            const className = context.config.handlersClassName || "Handlers";
            this.write(`#[cfg(feature = "guest")]
pub struct ${className} {}

#[cfg(feature = "guest")]
impl ${className} {\n`);
            context.config.handlerPreamble = true;
        }
        const operation = context.operation;
        this.write(utils_1.formatComment("    /// ", operation.description));
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
    visitAllOperationsAfter(context) {
        if (context.config.handlerPreamble == true) {
            this.write(`}\n\n`);
            delete context.config.handlerPreamble;
        }
        super.triggerAllOperationsAfter(context);
    }
}
exports.HandlersVisitor = HandlersVisitor;
