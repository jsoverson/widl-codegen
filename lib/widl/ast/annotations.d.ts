import { Location } from "./location";
import { Argument } from "./arguments";
import { AbstractNode } from "./node";
import { Name } from "./name";
export declare class Annotation extends AbstractNode {
    name: Name;
    arguments: Argument[];
    constructor(loc: Location | undefined, name: Name, args?: Argument[]);
}
