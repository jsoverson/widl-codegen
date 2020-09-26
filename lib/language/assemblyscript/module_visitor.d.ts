import { Context, Writer } from "../../widl";
import { ClassVisitor } from ".";
export declare class ModuleVisitor extends ClassVisitor {
    constructor(writer: Writer);
    visitDocumentBefore(context: Context): void;
    visitInterface(context: Context): void;
    visitOperation(context: Context): void;
    private convertOperationToObject;
    visitObjectFieldsAfter(context: Context): void;
    visitObjectAfter(context: Context): void;
}
