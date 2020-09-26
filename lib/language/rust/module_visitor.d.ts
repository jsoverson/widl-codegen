import { BaseVisitor, Context, Writer } from "../../widl";
export declare class ModuleVisitor extends BaseVisitor {
    constructor(writer: Writer);
    visitDocumentBefore(context: Context): void;
    visitDocumentAfter(context: Context): void;
    private convertOperationToObject;
}
