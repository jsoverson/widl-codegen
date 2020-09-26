import { Location } from "./location";
import { AbstractNode } from "./node";
export declare class Name extends AbstractNode {
    value: string;
    constructor(doc: Location | undefined, value: string);
}
