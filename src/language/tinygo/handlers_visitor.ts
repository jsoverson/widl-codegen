import { Context, Writer, BaseVisitor } from "../../widl";
import { expandType, isReference, mapArgs, mapArg, capitalize } from ".";
import { isVoid, strQuote } from "./helpers";

export class HandlersVisitor extends BaseVisitor {
  constructor(writer: Writer) {
    super(writer);
  }

  visitInterfaceBefore(context: Context): void {
    super.triggerInterfaceBefore(context);
    this.write(`type Handlers struct {\n`);
  }

  visitOperation(context: Context): void {
    const operation = context.operation!;
    this.write(`${capitalize(operation.name.value)} func(`);
    if (operation.isUnary()) {
      this.write(mapArg(operation.unaryOp()));
    } else {
      this.write(mapArgs(operation.arguments));
    }
    this.write(`)`);
    if (!isVoid(operation.type)) {
      this.write(
        ` (${expandType(
          operation.type,
          undefined,
          true,
          isReference(operation.annotations)
        )}, error)`
      );
    } else {
      this.write(` error`);
    }
    this.write(`\n`);
    super.triggerOperation(context);
  }

  visitInterfaceAfter(context: Context): void {
    this.write(`}\n\n`);
    super.triggerInterfaceAfter(context);
  }
}

export class RegisterVisitor extends BaseVisitor {
  constructor(writer: Writer) {
    super(writer);
  }

  visitInterfaceBefore(context: Context): void {
    super.triggerInterfaceBefore(context);
    this.write(`func (h Handlers) Register() {\n`);
  }

  visitOperation(context: Context): void {
    const operation = context.operation!;
    this.write(`if h.${capitalize(operation.name.value)} != nil {
      ${operation.name.value}Handler = h.${capitalize(operation.name.value)}
      wapc.RegisterFunction(${strQuote(operation.name.value)}, ${
      operation.name.value
    }Wrapper)
    }\n`);
    super.triggerOperation(context);
  }

  visitInterfaceAfter(context: Context): void {
    this.write(`}\n\n`);
    super.triggerInterfaceAfter(context);
  }
}
