import { FieldDefinition, Type, Annotation, ValuedDefinition, OperationDefinition, InputValueDefinition, ObjectDefinition } from "../../widl";
/**
 * Takes an array of ValuedDefintions and returns a string based on supplied params.
 * @param sep seperator between name and type
 * @param joinOn string that each ValuedDefintion is joined on
 * @returns string of format <name> <sep> <type><joinOn>...
 */
export declare function mapVals(vd: ValuedDefinition[], sep: string, joinOn: string): string;
/**
 * Creates string that is an msgpack size code block
 * @param variable variable that is being size
 * @param t the type node to encode
 * @param isReference if the type that is being expanded has a `@ref` annotation
 */
export declare function size(variable: string, t: Type, isReference: boolean): string;
/**
 * Creates string that is an msgpack encode code block
 * @param variable variable that is being encode
 * @param t the type node to encode
 * @param isReference if the type that is being expanded has a `@ref` annotation
 */
export declare function encode(variable: string, t: Type, isReference: boolean): string;
/**
 * Return default value for a FieldDefinition. Default value of objects are instantiated.
 * @param fieldDef FieldDefinition Node to get default value of
 */
export declare function defValue(fieldDef: FieldDefinition): string;
export declare function defaultValueForType(type: Type, packageName?: string): string;
/**
 * returns string in quotes
 * @param s string to have quotes
 */
export declare const strQuote: (s: string) => string;
/**
 * returns string of the expanded type of a node
 * @param type the type node that is being expanded
 * @param useOptional if the type that is being expanded is optional
 * @param isReference if the type that is being expanded has a `@ref` annotation
 */
export declare const expandType: (type: Type, packageName: string | undefined, useOptional: boolean, isReference: boolean) => string;
/**
 * Creates string that is an msgpack read code block
 * @param variable variable that is being read
 * @param t the type node to write
 * @param prevOptional if type is being expanded and the parent type is optional
 * @param isReference if the type that is being expanded has a `@ref` annotation
 */
export declare function read(variable: string, errorHandling: boolean, defaultVal: string, t: Type, prevOptional: boolean, isReference: boolean): string;
/**
 * Creates string that is an msgpack write code block
 * @param typeInst name of variable which object that is writting is assigning to
 * @param typeClass class that is being written
 * @param typeMeth method that is being called
 * @param variable variable that is being written
 * @param t the type node to write
 * @param prevOptional if type is being expanded and the parent type is optional
 * @param isReference if the type that is being expanded has a `@ref` annotation
 */
export declare function write(typeInst: string, typeClass: string, typeMeth: string, variable: string, t: Type, prevOptional: boolean, isReference: boolean): string;
/**
 * Determines if a node is a void node
 * @param t Node that is a Type node
 */
export declare function isVoid(t: Type): boolean;
/**
 * Determines if Type Node is a Named node and if its type is not one of the base translation types.
 * @param t Node that is a Type node
 */
export declare function isObject(t: Type): boolean;
/**
 * Determines if one of the annotations provided is a reference
 * @param annotations array of Annotations
 */
export declare function isReference(annotations: Annotation[]): boolean;
/**
 * Capitlizes a given string
 * @param str string to be capitlized
 * @returns string with first character capitalized. If empty string returns empty string.
 */
export declare function capitalize(str: string): string;
export declare function fieldName(str: string): string;
/**
 * Given an array of OperationDefintion returns them as functions with their arguments
 * @param ops
 */
export declare function opsAsFns(ops: OperationDefinition[]): string;
/**
 * returns string of args mapped to their type
 * @param args InputValueDefintion array which is an array of the arguments
 */
export declare function mapArgs(args: InputValueDefinition[], packageName?: string): string;
export declare function mapArg(arg: InputValueDefinition, packageName?: string): string;
/**
 * returns if a widl type is a node
 * @param o ObjectDefintion which correlates to a widl Type
 */
export declare function isNode(o: ObjectDefinition): boolean;
export declare function varAccessArg(variable: string, args: InputValueDefinition[]): string;
