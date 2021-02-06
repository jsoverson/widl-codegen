import { Context, Writer, BaseVisitor } from "../../widl";
export declare class HostVisitor extends BaseVisitor {
    constructor(writer: Writer);
    visitOperation(context: Context): void;
    visitAllOperationsAfter(context: Context): void;
}
