import { Context, Writer, BaseVisitor } from "../../widl";
import {
  expandType,
  defValue,
  isReference,
  DecoderVisitor,
  EncoderVisitor,
} from ".";

export class ClassVisitor extends BaseVisitor {
  constructor(writer: Writer) {
    super(writer);
  }

  visitObjectBefore(context: Context): void {
    super.triggerObjectBefore(context);
    this.write(`export class ${context.object!.name.value} implements Codec {\n`);
  }

  visitObjectField(context: Context): void {
    const field = context.field!;
    this.write(
      `  ${field.name.value}: ${expandType(
        field.type!,
        true,
        isReference(field.annotations)
      )} = ${defValue(field)};\n`
    );
    super.triggerObjectField(context);
  }

  visitObjectFieldsAfter(context: Context): void {
    this.write(`\n`);
    const decoder = new DecoderVisitor(this.writer);
    context.object!.accept(context, decoder);
    this.write(`\n`);
    const encoder = new EncoderVisitor(this.writer);
    context.object!.accept(context, encoder);
    super.triggerObjectFieldsAfter(context);
  }

  visitObjectAfter(context: Context): void {
    this.write(`}\n\n`);
    super.triggerObjectAfter(context);
  }
}
