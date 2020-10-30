import { Context, Writer, BaseVisitor } from "../../widl";
import {
  expandType,
  isReference,
  capitalize,
  isVoid,
  mapArgs,
  defaultValueForType,
} from ".";

export class ScaffoldVisitor extends BaseVisitor {
  constructor(writer: Writer) {
    super(writer);
  }

  visitDocumentBefore(context: Context): void {
    const packageName = context.config["package"] || "./module";
    super.visitDocumentBefore(context);
    this.write(`import { handleCall, handleAbort } from "@wapc/as-guest";\n`);
    this.write(`import { `);
    const types = new TypesVisitor(this.writer);
    context.document?.accept(context, types);
    this.write(`Handlers } from "${packageName}";\n`);
  }

  visitInterface(context: Context): void {
    this.write(`\n`);
    const registration = new HandlerRegistrationVisitor(this.writer);
    context.interface!.accept(context, registration);
  }

  visitOperation(context: Context): void {
    const operation = context.operation!;
    this.write(`\n`);
    this.write(
      `function ${operation.name.value}(${mapArgs(
        operation.arguments
      )}): ${expandType(
        operation.type,
        true,
        isReference(operation.annotations)
      )} {\n`
    );
    if (!isVoid(operation.type)) {
      const dv = defaultValueForType(operation.type);
      this.write(`  return ${dv};`);
    }
    this.write(`// TODO: Provide implementation.\n`);
    this.write(`}\n`);
  }

  visitDocumentAfter(context: Context): void {
    this.write(`\n`);
    this.write(`// Boilerplate code for waPC.  Do not remove.\n\n`);
    this
      .write(`export function __guest_call(operation_size: usize, payload_size: usize): bool {
  return handleCall(operation_size, payload_size);
}

// Abort function
function abort(
  message: string | null,
  fileName: string | null,
  lineNumber: u32,
  columnNumber: u32
): void {
  handleAbort(message, fileName, lineNumber, columnNumber);
}\n`);
  }
}

class HandlerRegistrationVisitor extends BaseVisitor {
  constructor(writer: Writer) {
    super(writer);
  }

  visitInterfaceBefore(context: Context): void {
    this.write(`export function wapc_init(): void {\n`);
  }

  visitOperation(context: Context): void {
    const operation = context.operation!;
    this.write(
      `  Handlers.register${capitalize(operation.name.value)}(${
        operation.name.value
      });\n`
    );
  }

  visitInterfaceAfter(context: Context): void {
    this.write(`}\n`);
  }
}

class TypesVisitor extends BaseVisitor {
  visitObject(context: Context): void {
    this.write(`${context.object!.name.value}, `);
  }
}
