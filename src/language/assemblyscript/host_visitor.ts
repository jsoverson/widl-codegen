import { Context, Writer, BaseVisitor } from "../../widl";
import {
  expandType,
  read,
  isReference,
  strQuote,
  capitalize,
  isVoid,
  isObject,
} from ".";

export class HostVisitor extends BaseVisitor {
  constructor(writer: Writer) {
    super(writer);
  }

  visitInterfaceBefore(context: Context): void {
    super.triggerInterfaceBefore(context);
    this.write(`export class Host {
      binding: string;
  
      constructor(binding: string) {
        this.binding = binding;
      }\n`);
  }

  visitOperation(context: Context): void {
    this.write(`\n`);
    const operation = context.operation!;
    this.write(`  ${operation.name.value}(`);
    operation.arguments.map((arg, index) => {
      if (index > 0) {
        this.write(`, `);
      }
      this.write(`${arg.name.value}: ${expandType(arg.type, false, false)}`);
    });
    this.write(`): ${expandType(operation.type, false, false)} {\n`);

    this.write(`  `);
    const retVoid = isVoid(operation.type);

    if (operation.isUnary()) {
      if (!retVoid) {
        this.write(`const payload = `);
      }
      this.write(
        `hostCall(this.binding, ${strQuote(
          context.namespace.name.value
        )}, ${strQuote(operation.name.value)}, toArrayBuffer(${
          operation.unaryOp().name.value
        }));\n`
      );
    } else {
      this.write(
        `const inputArgs = new ${capitalize(operation.name.value)}Args();\n`
      );
      operation.arguments.map((arg) => {
        const argName = arg.name.value;
        this.write(`  inputArgs.${argName} = ${argName};\n`);
      });
      if (!retVoid) {
        this.write(`const payload = `);
      }
      this.write(`hostCall(
      this.binding,
      ${strQuote(context.namespace.name.value)},
      ${strQuote(operation.name.value)},
      toArrayBuffer(inputArgs)
    );\n`);
    }
    if (!retVoid) {
      this.write(`    const decoder = new Decoder(payload);\n`);
      if (isObject(operation.type)) {
        this.write(
          `    return ${expandType(
            operation.type,
            false,
            isReference(operation.annotations)
          )}.decode(decoder);\n`
        );
      } else {
        this.write(
          `    const ${read(
            "ret",
            operation.type,
            false,
            isReference(operation.annotations)
          )}`
        );
        this.write(`    return ret;\n`);
      }
    }
    this.write(`  }\n`);
    super.triggerOperation(context);
  }

  visitInterfaceAfter(context: Context): void {
    this.write(`}\n\n`);
    super.triggerInterfaceAfter(context);
  }
}
