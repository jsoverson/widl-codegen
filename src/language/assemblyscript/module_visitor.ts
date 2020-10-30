import {
  Context,
  Writer,
  OperationDefinition,
  ObjectDefinition,
  FieldDefinition,
  Name,
} from "../../widl";
import {
  capitalize,
  ClassVisitor,
  HostVisitor,
  HandlersVisitor,
  WrappersVisitor,
  BuilderVisitor,
} from ".";

export class ModuleVisitor extends ClassVisitor {
  constructor(writer: Writer) {
    super(writer);
    this.setCallback("Interface", "host", (context: Context): void => {
      const host = new HostVisitor(writer);
      context.interface!.accept(context, host);
    });
    this.setCallback("Interface", "handlers", (context: Context): void => {
      const handlers = new HandlersVisitor(this.writer);
      context.interface!.accept(context, handlers);
    });
    this.setCallback("Interface", "wrappers", (context: Context): void => {
      const wrappers = new WrappersVisitor(this.writer);
      context.interface!.accept(context, wrappers);
    });
  }

  visitDocumentBefore(context: Context): void {
    this.write(
      `import { register, hostCall } from "@wapc/as-guest";
import { Decoder, Writer, Encoder, Sizer, Codec, toArrayBuffer, Value } from "@wapc/as-msgpack";\n`
    );
    super.triggerDocumentBefore(context);
  }

  visitInterface(context: Context): void {
    this.write(`\n`);
    super.triggerInterface(context);
  }

  visitOperation(context: Context): void {
    if (context.operation!.isUnary()) {
      return;
    }
    const argObject = this.convertOperationToObject(context.operation!);
    const args = new ClassVisitor(this.writer);
    argObject.accept(context.clone({ object: argObject }), args);
    super.triggerOperation(context);
  }

  private convertOperationToObject(
    operation: OperationDefinition
  ): ObjectDefinition {
    var fields = operation.arguments.map((arg) => {
      return new FieldDefinition(
        arg.loc,
        arg.name,
        arg.description,
        arg.type,
        arg.default,
        arg.annotations
      );
    });
    return new ObjectDefinition(
      operation.loc,
      new Name(operation.name.loc, capitalize(operation.name.value) + "Args"),
      undefined,
      [],
      operation.annotations,
      fields
    );
  }

  visitObjectFieldsAfter(context: Context): void {
    var object = context.object!;
    super.visitObjectFieldsAfter(context);
    this.write(`\n`);
    this.write(`  static newBuilder(): ${object.name.value}Builder {
      return new ${object.name.value}Builder();
    }\n`);
    super.triggerObjectFieldsAfter(context);
  }

  visitObjectAfter(context: Context): void {
    this.write(`}\n\n`);

    const builder = new BuilderVisitor(this.writer);
    context.object!.accept(context, builder);
    super.triggerObjectAfter(context);
  }
}
