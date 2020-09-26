import { Context, Writer, BaseVisitor } from "../../widl";
import { expandType, isReference, mapArgs, mapArg, capitalize } from ".";
import { functionName, isVoid, strQuote } from "./helpers";

export class HandlersVisitor extends BaseVisitor {
  constructor(writer: Writer) {
    super(writer);
  }

  visitInterfaceBefore(context: Context): void {
    super.triggerInterfaceBefore(context);
    this.write(`pub struct Handlers {}

impl Handlers {\n`);
  }

  visitOperation(context: Context): void {
    const operation = context.operation!;
    this.write(`pub fn register_${functionName(operation.name.value)}(f: fn(`);
    operation.arguments.forEach((arg, i) => {
      if (i > 0) {
        this.write(`, `);
      }
      this.write(
        expandType(arg.type, undefined, true, isReference(arg.annotations))
      );
    });
    this.write(`) -> HandlerResult<`);
    if (!isVoid(operation.type)) {
      this.write(
        `${expandType(
          operation.type,
          undefined,
          true,
          isReference(operation.annotations)
        )}`
      );
    } else {
      this.write(`()`);
    }
    this.write(`>) {
        *${functionName(
          operation.name.value
        ).toUpperCase()}.write().unwrap() = Some(f);
        register_function(&"${operation.name.value}", ${functionName(
      operation.name.value
    )}_wrapper);
    }\n`);
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
