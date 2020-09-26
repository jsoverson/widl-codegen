import { Context, Writer, BaseVisitor } from "../../widl";
export declare class HandlersVisitor extends BaseVisitor {
    constructor(writer: Writer);
    visitInterfaceBefore(context: Context): void;
    visitOperation(context: Context): void;
    visitInterfaceAfter(context: Context): void;
}
