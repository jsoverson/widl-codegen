"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructVisitor = void 0;
const widl_1 = require("../../widl");
const _1 = require(".");
class StructVisitor extends widl_1.BaseVisitor {
    constructor(writer) {
        super(writer);
    }
    visitObjectBefore(context) {
        super.triggerObjectBefore(context);
        this.write(`#[derive(Debug, PartialEq, Deserialize, Serialize, Default)]
pub struct ${context.object.name.value} {\n`);
    }
    visitObjectField(context) {
        const field = context.field;
        const expandedType = _1.expandType(field.type, undefined, true, _1.isReference(field.annotations));
        if (expandedType.indexOf("Vec<u8>") != -1) {
            this.write(`#[serde(with = "serde_bytes")]\n`);
        }
        this.write(`\t#[serde(rename = "${field.name.value}")]
      \tpub ${_1.fieldName(field.name.value)}: ${expandedType},\n`);
        super.triggerObjectField(context);
    }
    visitObjectAfter(context) {
        this.write(`}\n\n`);
    }
}
exports.StructVisitor = StructVisitor;
