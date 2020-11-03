import { Context, Writer, BaseVisitor } from "../../widl";
export declare class WrappersVisitor extends BaseVisitor {
    constructor(writer: Writer);
    visitOperation(context: Context): void;
    visitWrapperBeforeInvoke(context: Context): void;
    visitWrapperBeforeReturn(context: Context): void;
}
