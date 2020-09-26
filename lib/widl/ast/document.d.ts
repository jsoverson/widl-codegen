import { AbstractNode } from "./node";
import { Location } from "./location";
import { Definition } from "./definitions";
import { Context, Visitor } from "./visitor";
export declare class Document extends AbstractNode {
    definitions: Definition[];
    constructor(loc: Location | undefined, definitions: Definition[]);
    accept(context: Context, visitor: Visitor): void;
}
