import { Context, Writer, BaseVisitor } from "../../widl";
import { size, isReference, strQuote, capitalize, fieldName } from ".";

export class SizerVisitor extends BaseVisitor {
  constructor(writer: Writer) {
    super(writer);
  }

  visitObjectFieldsBefore(context: Context): void {
    this.write(
      `func (o *${capitalize(
        context.object!.name.value
      )}) Size(sizer *msgpack.Sizer) {
        if o == nil {
          sizer.WriteNil()
          return
        }
        sizer.WriteMapSize(${context.fields!.length})\n`
    );
    super.triggerObjectFieldsBefore(context);
  }

  visitObjectField(context: Context): void {
    const field = context.field!;
    this.write(`sizer.WriteString(${strQuote(field.name.value)})\n`);
    this.write(
      size(
        "o." + fieldName(field.name.value),
        field.type,
        isReference(field.annotations)
      )
    );
    super.triggerObjectField(context);
  }

  visitObjectFieldsAfter(context: Context): void {
    this.write(`}\n\n`);
    super.triggerObjectFieldsAfter(context);
  }
}
