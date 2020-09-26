import { Context, Writer, BaseVisitor } from "../../widl";
export declare class HostVisitor extends BaseVisitor {
    constructor(writer: Writer);
    visitInterfaceBefore(context: Context): void;
    visitOperation(context: Context): void;
}
