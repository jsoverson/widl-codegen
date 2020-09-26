import { Context, Writer, BaseVisitor } from "../../widl";
import {
  expandType,
  isReference,
  capitalize,
  isVoid,
  isObject,
  mapArgs,
  varAccessArg,
  functionName,
} from ".";

export class WrapperVarsVisitor extends BaseVisitor {
  constructor(writer: Writer) {
    super(writer);
  }

  visitInterfaceBefore(context: Context): void {
    this.write(`lazy_static! {\n`);
  }

  visitOperation(context: Context): void {
    const operation = context.operation!;
    this.write(
      `static ref ${functionName(
        operation.name.value
      ).toUpperCase()}: RwLock<Option<fn(`
    );
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
    this.write(`>>> = RwLock::new(None);\n`);
  }

  visitInterfaceAfter(context: Context): void {
    this.write(`}\n\n`);
  }
}

export class WrapperFuncsVisitor extends BaseVisitor {
  constructor(writer: Writer) {
    super(writer);
  }

  visitOperation(context: Context): void {
    const operation = context.operation!;
    this.write(
      `fn ${functionName(
        operation.name.value
      )}_wrapper(input_payload: &[u8]) -> CallResult {\n`
    );
    if (operation.isUnary()) {
      this.write(`let input = deserialize::<${expandType(
        operation.unaryOp().type,
        undefined,
        false,
        isReference(operation.annotations)
      )}>(input_payload)?;
      let lock = ${functionName(
        operation.name.value
      ).toUpperCase()}.read().unwrap().unwrap();
      let result = lock(input)?;\n`);
    } else {
      this.write(`let input = deserialize::<${capitalize(
        operation.name.value
      )}Args>(input_payload)?;
      let lock = ${functionName(
        operation.name.value
      ).toUpperCase()}.read().unwrap().unwrap();\n`);
      this.write(
        `let result = lock(${varAccessArg("input", operation.arguments)})?;\n`
      );
    }
    this.write(`Ok(serialize(result)?)\n`);
    this.write(`}\n\n`);
  }

  visitWrapperBeforeReturn(context: Context): void {
    this.triggerCallbacks(context, "WrapperBeforeReturn");
  }
}
