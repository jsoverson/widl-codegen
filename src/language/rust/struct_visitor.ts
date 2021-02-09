import { Context, Writer, BaseVisitor } from "../../widl";
import { expandType, fieldName, isReference } from ".";
import { formatComment } from "../utils";

export class StructVisitor extends BaseVisitor {
  constructor(writer: Writer) {
    super(writer);
  }

  visitObjectBefore(context: Context): void {
    super.triggerObjectBefore(context);
    this.write(formatComment("/// ", context.object!.description, 80));
    this
      .write(`#[derive(Debug, PartialEq, Deserialize, Serialize, Default, Clone)]
pub struct ${context.object!.name.value} {\n`);
  }

  visitObjectField(context: Context): void {
    const field = context.field!;
    const expandedType = expandType(
      field.type!,
      undefined,
      true,
      isReference(field.annotations)
    );
    this.write(formatComment("  /// ", field.description, 80));
    if (expandedType.indexOf("Vec<u8>") != -1) {
      this.write(`#[serde(with = "serde_bytes")]\n`);
    }
    this.write(
      `\t#[serde(rename = "${field.name.value}")]
      \tpub ${fieldName(field.name.value)}: ${expandedType},\n`
    );
    super.triggerObjectField(context);
  }

  visitObjectAfter(context: Context): void {
    this.write(`}\n\n`);
  }
}
