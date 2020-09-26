import { Context, Writer, BaseVisitor } from "../../widl";
import { expandType, fieldName, isReference } from ".";

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
      )} \`msgpack:"${field.name.value}"\`\n`
    );
    super.triggerObjectField(context);
  }

  visitObjectAfter(context: Context): void {
    this.write(`}\n\n`);
    super.triggerObjectAfter(context);
  }
}
