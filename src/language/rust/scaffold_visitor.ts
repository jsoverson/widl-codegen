import { Context, Writer, BaseVisitor } from "../../widl";
import {
  defaultValueForType,
  expandType,
  functionName,
  isReference,
  isVoid,
  mapArgs,
} from ".";

export class ScaffoldVisitor extends BaseVisitor {
  constructor(writer: Writer) {
    super(writer);
  }

  visitDocumentBefore(context: Context): void {
    const useName = context.config["use"] || "generated";
    super.visitDocumentBefore(context);
    this.write(`mod ${useName};
extern crate wapc_guest as guest;
use guest::prelude::*;
pub use ${useName}::*;\n\n`);
  }

  visitInterface(context: Context): void {
    const registration = new HandlerRegistrationVisitor(this.writer);
    context.interface!.accept(context, registration);
  }

  visitOperation(context: Context): void {
    const operation = context.operation!;
    this.write(`\n`);
    this.write(
      `fn ${functionName(operation.name.value)}(${mapArgs(
        operation.arguments,
        true
      )}) -> HandlerResult<`
    );
    if (!isVoid(operation.type)) {
      this.write(
        expandType(
          operation.type,
          undefined,
          true,
          isReference(operation.annotations)
        )
      );
    } else {
      this.write(`()`);
    }
    this.write(`> {\n`);
    if (!isVoid(operation.type)) {
      const dv = defaultValueForType(operation.type, undefined);
      this.write(`    Ok(${dv})`);
    } else {
      this.write(`    Ok(())`);
    }
    this.write(` // TODO: Provide implementation.\n`);
    this.write(`}\n`);
  }
}

class HandlerRegistrationVisitor extends BaseVisitor {
  constructor(writer: Writer) {
    super(writer);
  }

  visitInterfaceBefore(context: Context): void {
    this.write(`#[no_mangle]
pub fn wapc_init() {\n`);
  }

  visitOperation(context: Context): void {
    const operation = context.operation!;
    this.write(
      `    Handlers::register_${functionName(
        operation.name.value
      )}(${functionName(operation.name.value)});\n`
    );
  }

  visitInterfaceAfter(context: Context): void {
    this.write(`}\n`);
  }
}
