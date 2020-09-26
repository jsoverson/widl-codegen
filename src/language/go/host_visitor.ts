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
    this.write(`type Module struct {
\tinstance *wapc.Instance
}

func New(instance *wapc.Instance) *Module {
\treturn &Module{
\t\instance: instance,
\t}
}\n`);
  }

  visitOperation(context: Context): void {
    this.write(`\n`);
    const operation = context.operation!;
    this.write(
      `func (m *Module) ${capitalize(operation.name.value)}(ctx context.Context`
    );
    operation.arguments.map((arg, index) => {
      this.write(
        `, ${arg.name.value} ${expandType(arg.type, undefined, false, false)}`
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
    let defaultVal = "";
    if (!retVoid) {
      defaultVal = "ret, ";
      this.write(
        `var ret ${expandType(
          operation.type,
          undefined,
          false,
          isReference(operation.annotations)
        )}\n`
      );
    }
    if (operation.isUnary()) {
      this.write(`inputPayload, err := msgpack.Marshal(${
        operation.arguments[0].type instanceof Optional ? "" : "&"
      }${operation.arguments[0].name.value})
      if err != nil {
        return ret, err
      }\n`);
      if (!retVoid) {
        this.write(`payload, `);
      } else {
        this.write(`_, `);
      }
      this.write(
        `err := m.instance.Invoke(ctx, ${strQuote(
          operation.name.value
        )}, inputPayload)\n`
      );
    } else {
      this.write(`inputArgs := ${fieldName(operation.name.value)}Args{\n`);
      operation.arguments.map((arg) => {
        const argName = arg.name.value;
        this.write(`  ${fieldName(argName)}: ${argName},\n`);
      });
      this.write(`}\n`);
      this.write(`inputPayload, err := msgpack.Marshal(&inputArgs)
      if err != nil {
          return ${defaultVal}err
      }\n`);
      if (!retVoid) {
        this.write(`payload, `);
      } else {
        this.write(`_, `);
      }
      this.write(`err := m.instance.Invoke(
      ctx,
      ${strQuote(operation.name.value)},
      inputPayload,
    )\n`);
    }
    if (!retVoid) {
      this.write(`if err != nil {
        return ret, err
      }
	err = msgpack.Unmarshal(payload, &ret)
    return ret, err\n`);
    } else {
      this.write(`return err\n`);
    }
    this.write(`}\n`);
    super.triggerOperation(context);
  }
}
