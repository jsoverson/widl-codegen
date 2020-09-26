"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HostVisitor = void 0;
const widl_1 = require("../../widl");
const _1 = require(".");
class HostVisitor extends widl_1.BaseVisitor {
    constructor(writer) {
        super(writer);
    }
    visitInterfaceBefore(context) {
        super.triggerInterfaceBefore(context);
        this.write(`type Module struct {
\tinstance *wapc.Instance
}

func New(instance *wapc.Instance) *Module {
\treturn &Module{
\t\instance: instance,
\t}
}\n`);
    }
    visitOperation(context) {
        this.write(`\n`);
        const operation = context.operation;
        this.write(`func (m *Module) ${_1.capitalize(operation.name.value)}(ctx context.Context`);
        operation.arguments.map((arg, index) => {
            this.write(`, ${arg.name.value} ${_1.expandType(arg.type, undefined, false, false)}`);
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
        if (!retVoid) {
            defaultVal = "ret, ";
            this.write(`var ret ${_1.expandType(operation.type, undefined, false, _1.isReference(operation.annotations))}\n`);
        }
        if (operation.isUnary()) {
            this.write(`inputPayload, err := msgpack.Marshal(${operation.arguments[0].type instanceof widl_1.Optional ? "" : "&"}${operation.arguments[0].name.value})
      if err != nil {
        return ret, err
      }\n`);
            if (!retVoid) {
                this.write(`payload, `);
            }
            else {
                this.write(`_, `);
            }
            this.write(`err := m.instance.Invoke(ctx, ${_1.strQuote(operation.name.value)}, inputPayload)\n`);
        }
        else {
            this.write(`inputArgs := ${_1.fieldName(operation.name.value)}Args{\n`);
            operation.arguments.map((arg) => {
                const argName = arg.name.value;
                this.write(`  ${_1.fieldName(argName)}: ${argName},\n`);
            });
            this.write(`}\n`);
            this.write(`inputPayload, err := msgpack.Marshal(&inputArgs)
      if err != nil {
          return ${defaultVal}err
      }\n`);
            if (!retVoid) {
                this.write(`payload, `);
            }
            else {
                this.write(`_, `);
            }
            this.write(`err := m.instance.Invoke(
      ctx,
      ${_1.strQuote(operation.name.value)},
      inputPayload,
    )\n`);
        }
        if (!retVoid) {
            this.write(`if err != nil {
        return ret, err
      }
	err = msgpack.Unmarshal(payload, &ret)
    return ret, err\n`);
        }
        else {
            this.write(`return err\n`);
        }
        this.write(`}\n`);
        super.triggerOperation(context);
    }
}
exports.HostVisitor = HostVisitor;
