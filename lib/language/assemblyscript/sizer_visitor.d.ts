import { Context, Writer, BaseVisitor } from "../../widl";
export declare class SizerVisitor extends BaseVisitor {
    constructor(writer: Writer);
    visitObjectFieldsBefore(context: Context): void;
    visitObjectField(context: Context): void;
    visitObjectFieldsAfter(context: Context): void;
}
