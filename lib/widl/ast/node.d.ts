import { Context, Visitor } from "./visitor";
import { Location } from "./location";
export interface Node {
    getKind(): string;
    getLoc(): Location | undefined;
    accept(_context: Context, _visitor: Visitor): void;
}
export declare type NodeArray = Node[];
export declare abstract class AbstractNode implements Node {
    kind: string;
    loc?: Location;
    constructor(kind: string, loc: Location | undefined);
    getKind(): string;
    getLoc(): Location | undefined;
    accept(_context: Context, _visitor: Visitor): void;
}
