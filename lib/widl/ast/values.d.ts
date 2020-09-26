import { AbstractNode } from "./node";
import { Name } from "./name";
import { Location } from "./location";
export interface Value {
    getValue(): any;
    getKind(): string;
    getLoc(): Location | undefined;
}
export declare class Variable extends AbstractNode implements Value {
    name: Name;
    constructor(loc: Location | undefined, name: Name);
    getValue(): any;
    GetName(): any;
}
export declare class IntValue extends AbstractNode implements Value {
    value: string;
    constructor(loc: Location | undefined, value: string);
    getValue(): any;
}
export declare class FloatValue extends AbstractNode implements Value {
    value: string;
    constructor(loc: Location | undefined, value: string);
    getValue(): any;
}
export declare class StringValue extends AbstractNode implements Value {
    value: string;
    constructor(loc: Location | undefined, value: string);
    getValue(): string;
}
export declare class BooleanValue extends AbstractNode implements Value {
    value: boolean;
    constructor(loc: Location | undefined, value: boolean);
    getValue(): any;
}
export declare class EnumValue extends AbstractNode implements Value {
    value: string;
    constructor(loc: Location | undefined, value: string);
    getValue(): any;
}
export declare class ListValue extends AbstractNode implements Value {
    value: Value[];
    constructor(loc: Location | undefined, value: Value[]);
    getValue(): any;
}
export declare class MapValue extends AbstractNode implements Value {
    value: Value[];
    constructor(loc: Location | undefined, value: Value[]);
    getValue(): any;
}
export declare class ObjectValue extends AbstractNode implements Value {
    fields: ObjectField[];
    constructor(loc: Location | undefined, fields: ObjectField[]);
    getValue(): any;
}
export declare class ObjectField extends AbstractNode implements Value {
    value: Value;
    name: Name;
    constructor(loc: Location | undefined, value: Value, name: Name);
    getValue(): any;
}
