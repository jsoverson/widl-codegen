import { Context, Writer, BaseVisitor } from "../../widl";
export declare class StructVisitor extends BaseVisitor {
    constructor(writer: Writer);
    visitObjectBefore(context: Context): void;
    visitObjectField(context: Context): void;
    visitObjectAfter(context: Context): void;
}
