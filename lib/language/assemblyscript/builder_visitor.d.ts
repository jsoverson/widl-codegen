import { Context, Writer, BaseVisitor } from "../../widl";
export declare class BuilderVisitor extends BaseVisitor {
    constructor(writer: Writer);
    visitObjectBefore(context: Context): void;
    visitObjectField(context: Context): void;
    visitObjectFieldsAfter(context: Context): void;
    visitObjectAfter(context: Context): void;
}
