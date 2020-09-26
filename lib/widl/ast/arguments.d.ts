import { Location } from "./location";
import { Name } from "./name";
import { Value } from "./values";
import { AbstractNode } from "./node";
export declare class Argument extends AbstractNode {
    name: Name;
    value: Value;
    constructor(loc: Location | undefined, name: Name, value: Value);
}
