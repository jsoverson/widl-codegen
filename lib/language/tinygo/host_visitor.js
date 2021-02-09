"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HostVisitor = void 0;
const widl_1 = require("../../widl");
const _1 = require(".");
const helpers_1 = require("./helpers");
const utils_1 = require("../utils");
class HostVisitor extends widl_1.BaseVisitor {
    constructor(writer) {
        super(writer);
    }
    visitOperation(context) {
        if (!utils_1.shouldIncludeHostCall(context)) {
            return;
        }
        if (context.config.hostPreamble != true) {
            const className = context.config.hostClassName || "Host";
            this.write(`type ${className} struct {
\tbinding string
}

func New${className}(binding string) *${className} {
\treturn &${className}{
\t\tbinding: binding,
\t}
}\n`);
            context.config.hostPreamble = true;
        }
        const className = context.config.hostClassName || "Host";
        this.write(`\n`);
        const operation = context.operation;
        this.write(utils_1.formatComment("    // ", operation.description));
        this.write(`func (h *${className}) ${_1.capitalize(operation.name.value)}(`);
        operation.arguments.map((arg, index) => {
            if (index > 0) {
                this.write(`, `);
            }
            this.write(`${arg.name.value} ${_1.expandType(arg.type, undefined, false, false)}`);
        });
        this.write(`) `);
        const retVoid = _1.isVoid(operation.type);
        if (!retVoid) {
            this.write(`(${_1.expandType(operation.type, undefined, false, false)}, error)`);
        }
        else {
            this.write(`error`);
        }
        this.write(` {\n`);
        let defaultVal = "";
        let defaultValWithComma = "";
        if (!retVoid) {
            defaultVal = helpers_1.defaultValueForType(operation.type);
            defaultValWithComma = defaultVal + ", ";
        }
        if (operation.isUnary()) {
            this.write(`inputBytes, err := msgpack.ToBytes(&${operation.unaryOp().name.value})
      if err != nil {
        return ${defaultValWithComma}err
      }\n`);
            if (!retVoid) {
                this.write(`payload, `);
            }
            else {
                this.write(`_, `);
            }
            this.write(`err := wapc.HostCall(h.binding, ${_1.strQuote(context.namespace.name.value)}, ${_1.strQuote(operation.name.value)}, inputBytes)\n`);
        }
        else {
            this.write(`inputArgs := ${_1.fieldName(operation.name.value)}Args{\n`);
            operation.arguments.map((arg) => {
                const argName = arg.name.value;
                this.write(`  ${_1.fieldName(argName)}: ${argName},\n`);
            });
            this.write(`}\n`);
            this.write(`inputBytes, err := msgpack.ToBytes(&inputArgs)
      if err != nil {
        return ${defaultValWithComma}err
      }\n`);
            if (!retVoid) {
                this.write(`payload, `);
            }
            else {
                this.write(`_, `);
            }
            this.write(`err := wapc.HostCall(
      h.binding,
      ${_1.strQuote(context.namespace.name.value)},
      ${_1.strQuote(operation.name.value)},
      inputBytes,
    )\n`);
        }
        if (!retVoid) {
            this.write(`if err != nil {
        return ${defaultValWithComma}err
      }\n`);
            this.write(`decoder := msgpack.NewDecoder(payload)\n`);
            if (_1.isObject(operation.type)) {
                this.write(`return Decode${_1.expandType(operation.type, undefined, false, _1.isReference(operation.annotations))}(&decoder)\n`);
            }
            else {
                this.write(`${_1.read(true, "ret", true, defaultVal, operation.type, false, _1.isReference(operation.annotations))}`);
                this.write(`return ret, err\n`);
            }
        }
        else {
            this.write(`return err\n`);
        }
        this.write(`}\n`);
        super.triggerOperation(context);
    }
    visitAllOperationsAfter(context) {
        if (context.config.hostPreamble == true) {
            delete context.config.hostPreamble;
        }
        super.triggerAllOperationsAfter(context);
    }
}
exports.HostVisitor = HostVisitor;
