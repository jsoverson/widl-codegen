import { Context, Writer, BaseVisitor } from "../../widl";
export declare class DecoderVisitor extends BaseVisitor {
    constructor(writer: Writer);
    visitObjectFieldsBefore(context: Context): void;
    visitObjectField(context: Context): void;
    visitObjectFieldsAfter(context: Context): void;
}
