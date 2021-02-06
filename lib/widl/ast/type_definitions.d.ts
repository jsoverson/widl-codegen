import { StringValue, Value } from "./values";
import { AbstractNode } from "./node";
import { Definition } from "./definitions";
import { Annotation } from "./annotations";
import { Named, Type } from "./types";
import { Location } from "./location";
import { Name } from "./name";
import { Context, Visitor } from "./visitor";
export interface DescribableNode {
    GetDescription(): StringValue;
}
export interface TypeDefinition extends DescribableNode {
    getKind(): string;
    getLoc(): Location;
}
export interface TypeSystemDefinition {
    getKind(): string;
    getLoc(): Location;
}
export declare class NamespaceDefinition extends AbstractNode {
    description?: StringValue;
    name: Name;
    annotations?: Annotation[];
    constructor(loc: Location | undefined, desc: StringValue | undefined, name: Name, annotations?: Annotation[]);
    accept(context: Context, visitor: Visitor): void;
}
export declare class ObjectDefinition extends AbstractNode {
    name: Name;
    description?: StringValue;
    interfaces: Named[];
    annotations: Annotation[];
    fields: FieldDefinition[];
    constructor(loc: Location | undefined, name: Name, desc: StringValue | undefined, interfaces: Named[], annotations: Annotation[], fields: FieldDefinition[]);
    accept(context: Context, visitor: Visitor): void;
}
export declare class OperationDefinition extends AbstractNode {
    name: Name;
    description: StringValue | undefined;
    arguments: InputValueDefinition[];
    type: Type;
    annotations: Annotation[];
    unary: boolean;
    constructor(loc: Location | undefined, name: Name, desc: StringValue | undefined, args: InputValueDefinition[], type: Type, annotations: Annotation[], unary: boolean);
    isUnary(): boolean;
    unaryOp(): InputValueDefinition;
    mapTypeToTranslation(typeTranslation: (inp: Type) => string): Map<String, String>;
    accept(context: Context, visitor: Visitor): void;
}
export declare abstract class ValuedDefinition extends AbstractNode {
    name: Name;
    description?: StringValue;
    type: Type;
    default?: Value;
    annotations: Annotation[];
    constructor(kinds: string, loc: Location | undefined, name: Name, desc: StringValue | undefined, type: Type, defaultVal: Value | undefined, annotations: Annotation[]);
}
export declare class FieldDefinition extends ValuedDefinition {
    constructor(loc: Location | undefined, name: Name, desc: StringValue | undefined, type: Type, defaultVal: Value | undefined, annotations: Annotation[]);
    accept(context: Context, visitor: Visitor): void;
}
export declare class InputValueDefinition extends ValuedDefinition {
    constructor(loc: Location | undefined, name: Name, desc: StringValue | undefined, type: Type, defaultVal: Value | undefined, annotations: Annotation[]);
    accept(context: Context, visitor: Visitor): void;
}
export declare class InterfaceDefinition extends AbstractNode {
    description?: StringValue;
    operations: OperationDefinition[];
    annotations: Annotation[];
    constructor(loc?: Location, desc?: StringValue, op?: OperationDefinition[], annotations?: Annotation[]);
    accept(context: Context, visitor: Visitor): void;
}
export declare class RoleDefinition extends AbstractNode {
    name: Name;
    description?: StringValue;
    operations: OperationDefinition[];
    annotations: Annotation[];
    constructor(loc: Location | undefined, name: Name, desc?: StringValue, op?: OperationDefinition[], annotations?: Annotation[]);
    accept(context: Context, visitor: Visitor): void;
}
export declare class UnionDefinition extends AbstractNode implements Definition {
    name: Name;
    description?: StringValue;
    annotations: Annotation[];
    types: Named[];
    constructor(loc: Location | undefined, name: Name, desc: StringValue | undefined, annotations: Annotation[], types: Named[]);
}
export declare class EnumDefinition extends AbstractNode implements Definition {
    name: Name;
    description?: StringValue;
    annotations: Annotation[];
    values: EnumValueDefinition[];
    constructor(loc: Location | undefined, name: Name, desc: StringValue | undefined, annotations: Annotation[], values: EnumValueDefinition[]);
}
export declare class EnumValueDefinition extends AbstractNode implements Definition {
    name: Name;
    description?: StringValue;
    annotations: Annotation[];
    constructor(loc: Location | undefined, name: Name, desc: StringValue | undefined, annotations: Annotation[]);
}
