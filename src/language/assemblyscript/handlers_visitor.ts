import { Context, Writer, BaseVisitor } from "../../widl";
import {
  expandType,
  isReference,
  strQuote,
  mapArgs,
  mapArg,
  capitalize,
} from ".";

export class HandlersVisitor extends BaseVisitor {
  constructor(writer: Writer) {
    super(writer);
  }

  visitInterfaceBefore(context: Context): void {
    super.triggerInterfaceBefore(context);
    this.write(`export class Handlers {\n`);
  }

  visitOperation(context: Context): void {
    this.write(`\n`);
    const operation = context.operation!;
    let opVal = "";
    opVal += `static register${capitalize(operation.name.value)}(handler: (`;
    if (operation.isUnary()) {
      opVal += mapArg(operation.unaryOp());
    } else {
      opVal += mapArgs(operation.arguments);
    }
    opVal += `) => ${expandType(
      operation.type,
      true,
      isReference(operation.annotations)
    )}): void {\n`;
    opVal += `${operation.name.value}Handler = handler;\n`;
    opVal += `register(${strQuote(operation.name.value)}, ${
      operation.name.value
    }Wrapper);\n}\n`;
    this.write(opVal);
    super.triggerOperation(context);
  }

  visitInterfaceAfter(context: Context): void {
    this.write(`}\n\n`);
    super.triggerInterfaceAfter(context);
  }
}
