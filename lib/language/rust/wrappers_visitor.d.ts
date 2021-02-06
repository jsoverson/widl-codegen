import { Context, Writer, BaseVisitor } from "../../widl";
export declare class WrapperVarsVisitor extends BaseVisitor {
    constructor(writer: Writer);
    visitOperation(context: Context): void;
    visitAllOperationsAfter(context: Context): void;
}
export declare class WrapperFuncsVisitor extends BaseVisitor {
    constructor(writer: Writer);
    visitOperation(context: Context): void;
    visitWrapperBeforeReturn(context: Context): void;
}
