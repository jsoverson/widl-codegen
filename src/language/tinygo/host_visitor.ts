import { Context, Writer, BaseVisitor, Optional, List } from "../../widl";
import {
  expandType,
  read,
  isReference,
  strQuote,
  capitalize,
  fieldName,
  isVoid,
  isObject,
} from ".";
import { defaultValueForType } from "./helpers";

export class HostVisitor extends BaseVisitor {
  constructor(writer: Writer) {
    super(writer);
  }

  visitInterfaceBefore(context: Context): void {
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

  visitOperation(context: Context): void {
    this.write(`\n`);
    const operation = context.operation!;
    this.write(`func (h *Host) ${capitalize(operation.name.value)}(`);
    operation.arguments.map((arg, index) => {
      if (index > 0) {
        this.write(`, `);
      }
      this.write(
        `${arg.name.value} ${expandType(arg.type, undefined, false, false)}`
      );
    });
    this.write(`) `);
    const retVoid = isVoid(operation.type);
    if (!retVoid) {
      this.write(
        `(${expandType(operation.type, undefined, false, false)}, error)`
      );
    } else {
      this.write(`error`);
    }
    this.write(` {\n`);

    if (operation.isUnary()) {
      if (!retVoid) {
        this.write(`payload, `);
      } else {
        this.write(`_, `);
      }
      this.write(
        `err := wapc.HostCall(h.binding, ${strQuote(
          context.namespace.name.value
        )}, ${strQuote(operation.name.value)}, ${
          operation.unaryOp().name.value
        }.ToBuffer())\n`
      );
    } else {
      this.write(`inputArgs := ${fieldName(operation.name.value)}Args{\n`);
      operation.arguments.map((arg) => {
        const argName = arg.name.value;
        this.write(`  ${fieldName(argName)}: ${argName},\n`);
      });
      this.write(`}\n`);
      if (!retVoid) {
        this.write(`payload, `);
      } else {
        this.write(`_, `);
      }
      this.write(`err := wapc.HostCall(
      h.binding,
      ${strQuote(context.namespace.name.value)},
      ${strQuote(operation.name.value)},
      inputArgs.ToBuffer(),
    )\n`);
    }
    if (!retVoid) {
      const defaultVal = defaultValueForType(operation.type);
      this.write(`if err != nil {
        return ${defaultVal}, err
      }\n`);
      this.write(`decoder := msgpack.NewDecoder(payload)\n`);
      if (isObject(operation.type)) {
        this.write(
          `return Decode${expandType(
            operation.type,
            undefined,
            false,
            isReference(operation.annotations)
          )}(&decoder)\n`
        );
      } else {
        this.write(
          `${read(
            "ret",
            true,
            defaultVal,
            operation.type,
            false,
            isReference(operation.annotations)
          )}`
        );
        this.write(`return ret, err\n`);
      }
    } else {
      this.write(`return err\n`);
    }
    this.write(`}\n`);
    super.triggerOperation(context);
  }
}
