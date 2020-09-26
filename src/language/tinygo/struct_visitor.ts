import { Context, Writer, BaseVisitor } from "../../widl";
import {
  expandType,
  fieldName,
  isReference,
  DecoderVisitor,
  SizerVisitor,
  EncoderVisitor,
} from ".";

export class StructVisitor extends BaseVisitor {
  constructor(writer: Writer) {
    super(writer);
  }

  visitObjectBefore(context: Context): void {
    super.triggerObjectBefore(context);
    this.write(`type ${context.object!.name.value} struct {\n`);
  }

  visitObjectField(context: Context): void {
    const field = context.field!;
    this.write(
      `\t${fieldName(field.name.value)} ${expandType(
        field.type!,
        undefined,
        true,
        isReference(field.annotations)
      )}\n`
    );
    super.triggerObjectField(context);
  }

  visitObjectAfter(context: Context): void {
    this.write(`}\n\n`);
    super.triggerObjectAfter(context);
    const object = context.object!;
    const decoder = new DecoderVisitor(this.writer);
    object.accept(context, decoder);
    const sizer = new SizerVisitor(this.writer);
    object.accept(context, sizer);
    const encoder = new EncoderVisitor(this.writer);
    object.accept(context, encoder);
    this.write(`func (o *${object.name.value}) ToBuffer() []byte {
      var sizer msgpack.Sizer
      o.Size(&sizer)
      buffer := make([]byte, sizer.Len())
      encoder := msgpack.NewEncoder(buffer)
      o.Encode(&encoder)
      return buffer
    }\n\n`);
  }
}
