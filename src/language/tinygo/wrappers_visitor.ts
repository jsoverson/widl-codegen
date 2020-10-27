import { Context, Writer, BaseVisitor } from "../../widl";
import {
  expandType,
  size,
  encode,
  isReference,
  capitalize,
  isVoid,
  isObject,
  mapArgs,
  varAccessArg,
} from ".";

export class WrapperVarsVisitor extends BaseVisitor {
  constructor(writer: Writer) {
    super(writer);
  }

  visitInterfaceBefore(context: Context): void {
    this.write(`var (\n`);
  }

  visitOperation(context: Context): void {
    const operation = context.operation!;
    this.write(
      `\t${operation.name.value}Handler func (${mapArgs(operation.arguments)}) `
    );
    if (!isVoid(operation.type)) {
      this.write(
        `(${expandType(
          operation.type,
          undefined,
          true,
          isReference(operation.annotations)
        )}, error)`
      );
    } else {
      this.write(`error`);
    }
    this.write(`\n`);
  }

  visitInterfaceAfter(context: Context): void {
    this.write(`)\n\n`);
  }
}

export class WrapperFuncsVisitor extends BaseVisitor {
  constructor(writer: Writer) {
    super(writer);
  }

  visitOperation(context: Context): void {
    const operation = context.operation!;
    this
      .write(`func ${operation.name.value}Wrapper(payload []byte) ([]byte, error) {
      decoder := msgpack.NewDecoder(payload)\n`);
    if (operation.isUnary()) {
      this.write(`var request ${expandType(
        operation.unaryOp().type,
        undefined,
        false,
        isReference(operation.annotations)
      )}
      request.Decode(&decoder)\n`);
      this.write(isVoid(operation.type) ? "err := " : "response, err := ");
      this.write(`${operation.name.value}Handler(request)\n`);
    } else {
      this.write(`var inputArgs ${capitalize(operation.name.value)}Args
      inputArgs.Decode(&decoder)\n`);
      this.write(isVoid(operation.type) ? "err := " : "response, err := ");
      this.write(
        `${operation.name.value}Handler(${varAccessArg(
          "inputArgs",
          operation.arguments
        )})\n`
      );
    }
    this.write(`if err != nil {
      return nil, err
    }\n`);
    if (isVoid(operation.type)) {
      this.visitWrapperBeforeReturn(context);
      this.write(`return []byte{}, nil\n`);
    } else if (isObject(operation.type)) {
      this.visitWrapperBeforeReturn(context);
      this.write(`return response.ToBuffer(), nil\n`);
    } else {
      this.write(`var sizer msgpack.Sizer
      ${size("response", operation.type, isReference(operation.annotations))}
      ua := make([]byte, sizer.Len());
      encoder := msgpack.NewEncoder(ua);
      ${encode(
        "response",
        operation.type,
        isReference(operation.annotations)
      )}\n`);
      this.visitWrapperBeforeReturn(context);
      this.write(`return ua, nil\n`);
    }
    this.write(`}\n\n`);
  }

  visitWrapperBeforeReturn(context: Context): void {
    this.triggerCallbacks(context, "WrapperBeforeReturn");
  }
}