import { Context, Writer, BaseVisitor } from "../../widl";
export declare class ScaffoldVisitor extends BaseVisitor {
    constructor(writer: Writer);
    visitDocumentBefore(context: Context): void;
    visitInterface(context: Context): void;
    visitOperation(context: Context): void;
    visitDocumentAfter(context: Context): void;
}
