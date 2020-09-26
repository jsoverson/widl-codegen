import { Context, Writer, BaseVisitor } from "../../widl";
import { size, isReference, strQuote } from ".";

export class SizerVisitor extends BaseVisitor {
  constructor(writer: Writer) {
    super(writer);
  }

  visitObjectFieldsBefore(context: Context): void {
    this.write(
      `  size(sizer: Sizer): void {
        sizer.writeMapSize(${context.fields!.length});\n`
    );
    super.triggerObjectFieldsBefore(context);
  }

  visitObjectField(context: Context): void {
    const field = context.field!;
    this.write(`sizer.writeString(${strQuote(field.name.value)});\n`);
    this.write(
      size(
        "this." + field.name.value,
        field.type,
        isReference(field.annotations)
      )
    );
    super.triggerObjectField(context);
  }

  visitObjectFieldsAfter(context: Context): void {
    this.write(`  }\n`);
    super.triggerObjectFieldsAfter(context);
  }
}
