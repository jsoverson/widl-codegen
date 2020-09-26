"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HostVisitor = void 0;
const widl_1 = require("../../widl");
const _1 = require(".");
const helpers_1 = require("./helpers");
class HostVisitor extends widl_1.BaseVisitor {
    constructor(writer) {
        super(writer);
    }
    visitInterfaceBefore(context) {
        super.triggerInterfaceBefore(context);
        this.write(`type Host struct {
\tbinding string
}

func NewHost(binding string) *Host {
\treturn &Host{
\t\tbinding: binding,
\t}
}\n`);
    }
    visitOperation(context) {
        this.write(`\n`);
        const operation = context.operation;
        this.write(`func (h *Host) ${_1.capitalize(operation.name.value)}(`);
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
        if (operation.isUnary()) {
            if (!retVoid) {
                this.write(`payload, `);
            }
            else {
                this.write(`_, `);
            }
            this.write(`err := wapc.HostCall(h.binding, ${_1.strQuote(context.namespace.name.value)}, ${_1.strQuote(operation.name.value)}, ${operation.unaryOp().name.value}.ToBuffer())\n`);
        }
        else {
            this.write(`inputArgs := ${_1.fieldName(operation.name.value)}Args{\n`);
            operation.arguments.map((arg) => {
                const argName = arg.name.value;
                this.write(`  ${_1.fieldName(argName)}: ${argName},\n`);
            });
            this.write(`}\n`);
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
      inputArgs.ToBuffer(),
    )\n`);
        }
        if (!retVoid) {
            const defaultVal = helpers_1.defaultValueForType(operation.type);
            this.write(`if err != nil {
        return ${defaultVal}, err
      }\n`);
            this.write(`decoder := msgpack.NewDecoder(payload)\n`);
            if (_1.isObject(operation.type)) {
                this.write(`return Decode${_1.expandType(operation.type, undefined, false, _1.isReference(operation.annotations))}(&decoder)\n`);
            }
            else {
                this.write(`${_1.read("ret", true, defaultVal, operation.type, false, _1.isReference(operation.annotations))}`);
                this.write(`return ret, err\n`);
            }
        }
        else {
            this.write(`return err\n`);
        }
        this.write(`}\n`);
        super.triggerOperation(context);
    }
}
exports.HostVisitor = HostVisitor;
