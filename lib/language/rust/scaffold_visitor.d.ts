import { Context, Writer, BaseVisitor } from "../../widl";
export declare class ScaffoldVisitor extends BaseVisitor {
    constructor(writer: Writer);
    visitDocumentBefore(context: Context): void;
    visitAllOperationsBefore(context: Context): void;
    visitOperation(context: Context): void;
}
