import { Location } from "./location";
import { AbstractNode } from "./node";
import { Name } from "./name";
import { StringValue } from "./values";
import { InputValueDefinition } from "./type_definitions";
export interface Definition {
    getKind(): string;
    getLoc(): Location | undefined;
}
export declare class AnnotationDefinition extends AbstractNode implements Definition {
    name: Name;
    description?: StringValue;
    arguments: InputValueDefinition[];
    locations: Name[];
    constructor(loc: Location | undefined, name: Name, description: StringValue | undefined, args: InputValueDefinition[], locations: Name[]);
    getDescription(): StringValue | undefined;
}
