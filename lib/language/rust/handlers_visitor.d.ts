import { Context, Writer, BaseVisitor } from "../../widl";
export declare class HandlersVisitor extends BaseVisitor {
    constructor(writer: Writer);
    visitOperation(context: Context): void;
    visitAllOperationsAfter(context: Context): void;
}
