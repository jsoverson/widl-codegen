"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.varAccessArg = exports.isNode = exports.mapArg = exports.mapArgs = exports.opsAsFns = exports.fieldName = exports.functionName = exports.capitalize = exports.isReference = exports.isObject = exports.isVoid = exports.expandType = exports.strQuote = exports.defaultValueForType = exports.defValue = exports.mapVals = void 0;
const widl_1 = require("../../widl");
const constant_1 = require("./constant");
const snake_case_typescript_1 = __importDefault(require("snake-case-typescript"));
/**
 * Takes an array of ValuedDefintions and returns a string based on supplied params.
 * @param sep seperator between name and type
 * @param joinOn string that each ValuedDefintion is joined on
 * @returns string of format <name> <sep> <type><joinOn>...
 */
function mapVals(vd, sep, joinOn) {
    return vd
        .map((vd) => `${vd.name.value}${sep} ${exports.expandType(vd.type, undefined, true, isReference(vd.annotations))}`)
        .join(joinOn);
}
exports.mapVals = mapVals;
/**
 * Return default value for a FieldDefinition. Default value of objects are instantiated.
 * @param fieldDef FieldDefinition Node to get default value of
 */
function defValue(fieldDef) {
    const name = fieldDef.name.value;
    const type = fieldDef.type;
    if (fieldDef.default) {
        let returnVal = fieldDef.default.getValue();
        if (fieldDef.type instanceof widl_1.Named) {
            returnVal =
                fieldDef.type.Name.value == "string"
                    ? exports.strQuote(returnVal)
                    : returnVal;
        }
        return returnVal;
    }
    switch (type.constructor) {
        case widl_1.Optional:
            return "None";
        case widl_1.List:
        case widl_1.Map:
            return `${exports.expandType(type, undefined, false, isReference(fieldDef.annotations))}::new()`;
        case widl_1.Named:
            switch (type.Name.value) {
                case "ID":
                case "string":
                    return '""';
                case "bool":
                    return "false";
                case "i8":
                case "u8":
                case "i16":
                case "u16":
                case "i32":
                case "u32":
                case "i64":
                case "u64":
                case "f32":
                case "f64":
                    return "0";
                case "bytes":
                    return "Vec::new()";
                default:
                    return `${capitalize(name)}()`; // reference to something else
            }
    }
    return `???${exports.expandType(type, undefined, false, isReference(fieldDef.annotations))}???`;
}
exports.defValue = defValue;
function defaultValueForType(type, packageName) {
    switch (type.constructor) {
        case widl_1.Optional:
            return "None";
        case widl_1.List:
        case widl_1.Map:
            return `${exports.expandType(type, packageName, false, false)}{}`;
        case widl_1.Named:
            switch (type.Name.value) {
                case "ID":
                case "string":
                    return '"".to_string()';
                case "bool":
                    return "false";
                case "i8":
                case "u8":
                case "i16":
                case "u16":
                case "i32":
                case "u32":
                case "i64":
                case "u64":
                case "f32":
                case "f64":
                    return "0";
                case "bytes":
                    return "Vec::new()";
                default:
                    const prefix = packageName != undefined && packageName != ""
                        ? packageName + "."
                        : "";
                    return `${prefix}${capitalize(type.Name.value)}::default()`; // reference to something else
            }
    }
    return "???";
}
exports.defaultValueForType = defaultValueForType;
/**
 * returns string in quotes
 * @param s string to have quotes
 */
exports.strQuote = (s) => {
    return `\"${s}\"`;
};
/**
 * returns string of the expanded type of a node
 * @param type the type node that is being expanded
 * @param useOptional if the type that is being expanded is optional
 * @param isReference if the type that is being expanded has a `@ref` annotation
 */
exports.expandType = (type, packageName, useOptional, isReference) => {
    switch (true) {
        case type instanceof widl_1.Named:
            if (isReference) {
                return "String";
            }
            var namedValue = type.Name.value;
            const translation = constant_1.translations.get(namedValue);
            if (translation != undefined) {
                return (namedValue = translation);
            }
            if (isObject(type) && packageName != undefined && packageName != "") {
                return packageName + "." + namedValue;
            }
            return namedValue;
        case type instanceof widl_1.Map:
            return `std::collections::HashMap<${exports.expandType(type.keyType, packageName, true, isReference)}, ${exports.expandType(type.valueType, packageName, true, isReference)}>`;
        case type instanceof widl_1.List:
            return `Vec<${exports.expandType(type.type, packageName, true, isReference)}>`;
        case type instanceof widl_1.Optional:
            const nestedType = type.type;
            let expanded = exports.expandType(nestedType, packageName, true, isReference);
            if (useOptional) {
                return `Option<${expanded}>`;
            }
            return expanded;
        default:
            return "unknown";
    }
};
/**
 * Determines if a node is a void node
 * @param t Node that is a Type node
 */
function isVoid(t) {
    if (t instanceof widl_1.Named) {
        return t.Name.value == "void";
    }
    return false;
}
exports.isVoid = isVoid;
/**
 * Determines if Type Node is a Named node and if its type is not one of the base translation types.
 * @param t Node that is a Type node
 */
function isObject(t) {
    if (t instanceof widl_1.Named) {
        return !constant_1.primitives.has(t.Name.value);
    }
    return false;
}
exports.isObject = isObject;
/**
 * Determines if one of the annotations provided is a reference
 * @param annotations array of Annotations
 */
function isReference(annotations) {
    for (let annotation of annotations) {
        if (annotation.name.value == "ref" ||
            annotation.name.value == "reference") {
            return true;
        }
    }
    return false;
}
exports.isReference = isReference;
/**
 * Capitlizes a given string
 * @param str string to be capitlized
 * @returns string with first character capitalized. If empty string returns empty string.
 */
function capitalize(str) {
    if (str.length == 0)
        return str;
    if (str.length == 1)
        return str[0].toUpperCase();
    return str[0].toUpperCase() + str.slice(1);
}
exports.capitalize = capitalize;
function functionName(str) {
    return snake_case_typescript_1.default(str);
}
exports.functionName = functionName;
function fieldName(str) {
    return snake_case_typescript_1.default(str);
}
exports.fieldName = fieldName;
/**
 * Given an array of OperationDefintion returns them as functions with their arguments
 * @param ops
 */
function opsAsFns(ops) {
    return ops
        .map((op) => {
        return `func ${op.name.value}(${mapArgs(op.arguments)}) ${exports.expandType(op.type, undefined, true, isReference(op.annotations))} {\n}`;
    })
        .join("\n");
}
exports.opsAsFns = opsAsFns;
/**
 * returns string of args mapped to their type
 * @param args InputValueDefintion array which is an array of the arguments
 */
function mapArgs(args, template = false) {
    return args
        .map((arg) => {
        return mapArg(arg, template);
    })
        .join(", ");
}
exports.mapArgs = mapArgs;
function mapArg(arg, template = false) {
    return ((template ? "_" : "") +
        `${arg.name.value}: ${exports.expandType(arg.type, undefined, true, isReference(arg.annotations))}`);
}
exports.mapArg = mapArg;
/**
 * returns if a widl type is a node
 * @param o ObjectDefintion which correlates to a widl Type
 */
function isNode(o) {
    for (const field of o.fields) {
        if (field.name.value.toLowerCase() == "id") {
            return true;
        }
    }
    return false;
}
exports.isNode = isNode;
function varAccessArg(variable, args) {
    return args
        .map((arg) => {
        return `${variable}.${snake_case_typescript_1.default(arg.name.value)}`;
    })
        .join(", ");
}
exports.varAccessArg = varAccessArg;
