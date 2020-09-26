import { Name } from "./name";
import { AbstractNode } from "./node";
import { Location } from "./location";
export interface Type {
    getKind(): string;
    getLoc(): Location | undefined;
    string(): string;
}
export declare class Named extends AbstractNode implements Type {
    Name: Name;
    constructor(loc: Location | undefined, name: Name);
    string(): string;
}
export declare class List extends AbstractNode implements Type {
    type: Type;
    constructor(loc: Location | undefined, type: Type);
    string(): string;
}
export declare class Map extends AbstractNode implements Type {
    keyType: Type;
    valueType: Type;
    constructor(loc: Location | undefined, keyType: Type, valueType: Type);
    string(): string;
}
export declare class Optional extends AbstractNode implements Type {
    type: Type;
    constructor(loc: Location | undefined, type: Type);
    string(): string;
}
