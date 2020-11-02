"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.varAccessArg = exports.isNode = exports.mapArg = exports.mapArgs = exports.opsAsFns = exports.capitalize = exports.isReference = exports.isObject = exports.isVoid = exports.write = exports.read = exports.expandType = exports.strQuote = exports.defaultValueForType = exports.defValue = exports.encode = exports.size = exports.mapVals = void 0;
const widl_1 = require("../../widl");
const constant_1 = require("./constant");
/**
 * Takes an array of ValuedDefintions and returns a string based on supplied params.
 * @param sep seperator between name and type
 * @param joinOn string that each ValuedDefintion is joined on
 * @returns string of format <name> <sep> <type><joinOn>...
 */
function mapVals(vd, sep, joinOn) {
    return vd
        .map((vd) => `${vd.name.value}${sep} ${exports.expandType(vd.type, true, isReference(vd.annotations))};`)
        .join(joinOn);
}
exports.mapVals = mapVals;
/**
 * Creates string that is an msgpack size code block
 * @param variable variable that is being size
 * @param t the type node to encode
 * @param isReference if the type that is being expanded has a `@ref` annotation
 */
function size(variable, t, isReference) {
    return write("sizer", "Writer", "encode", variable, t, false, isReference);
}
exports.size = size;
/**
 * Creates string that is an msgpack encode code block
 * @param variable variable that is being encode
 * @param t the type node to encode
 * @param isReference if the type that is being expanded has a `@ref` annotation
 */
function encode(variable, t, isReference) {
    return write("encoder", "Writer", "encode", variable, t, false, isReference);
}
exports.encode = encode;
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
            return "null";
        case widl_1.List:
        case widl_1.Map:
            return `new ${exports.expandType(type, false, isReference(fieldDef.annotations))}()`;
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
                    return "new ArrayBuffer(0)";
                default:
                    return `new ${capitalize(type.Name.value)}()`; // reference to something else
            }
    }
    return `???${exports.expandType(type, false, isReference(fieldDef.annotations))}???`;
}
exports.defValue = defValue;
function defaultValueForType(type) {
    switch (type.constructor) {
        case widl_1.Optional:
            return "null";
        case widl_1.List:
        case widl_1.Map:
            return `new ${exports.expandType(type, false, false)}()`;
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
                    return "new ArrayBuffer(0)";
                default:
                    return `new ${capitalize(type.Name.value)}()`; // reference to something else
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
exports.expandType = (type, useOptional, isReference) => {
    switch (true) {
        case type instanceof widl_1.Named:
            if (isReference) {
                return "string";
            }
            const namedValue = type.Name.value;
            const translation = constant_1.translations.get(namedValue);
            if (translation != undefined) {
                return translation;
            }
            return namedValue;
        case type instanceof widl_1.Map:
            return `Map<${exports.expandType(type.keyType, true, isReference)},${exports.expandType(type.valueType, true, isReference)}>`;
        case type instanceof widl_1.List:
            return `Array<${exports.expandType(type.type, true, isReference)}>`;
        case type instanceof widl_1.Optional:
            let expanded = exports.expandType(type.type, true, isReference);
            if (useOptional) {
                return `${expanded} | null`;
            }
            return expanded;
        default:
            return "unknown";
    }
};
/**
 * Creates string that is an msgpack read code block
 * @param variable variable that is being read
 * @param t the type node to write
 * @param prevOptional if type is being expanded and the parent type is optional
 * @param isReference if the type that is being expanded has a `@ref` annotation
 */
function read(variable, t, prevOptional, isReference) {
    let prefix = "return ";
    if (variable != "") {
        prefix = variable + " = ";
    }
    switch (true) {
        case t instanceof widl_1.Named:
            if (isReference) {
                return prefix + "decoder.readString()";
            }
            let namedNode = t;
            if (constant_1.decodeFuncs.has(namedNode.Name.value)) {
                return `${prefix}decoder.${constant_1.decodeFuncs.get(namedNode.Name.value)}();\n`;
            }
            return `${prefix}${namedNode.Name.value}.decode(decoder);`;
        case t instanceof widl_1.Map:
            let code = `${prefix}decoder.read`;
            if (prevOptional) {
                code += "Nullable";
            }
            code += "Map(\n";
            code += `(decoder: Decoder): ${exports.expandType(t.keyType, true, isReference)} => {\n`;
            code += read("", t.keyType, false, isReference);
            code += "},\n";
            code += `(decoder: Decoder): ${exports.expandType(t.valueType, true, isReference)} => {\n`;
            code += read("", t.valueType, false, isReference);
            code += "});\n";
            return code;
        case t instanceof widl_1.List:
            let listCode = "";
            listCode += `${prefix}decoder.read`;
            if (prevOptional) {
                listCode += "Nullable";
            }
            listCode += `Array((decoder: Decoder): ${exports.expandType(t.type, true, isReference)} => {\n`;
            listCode += read("", t.type, false, isReference);
            listCode += "});\n";
            return listCode;
        case t instanceof widl_1.Optional:
            const optNode = t;
            optNode.type;
            switch (true) {
                case optNode.type instanceof widl_1.List:
                case optNode.type instanceof widl_1.Map:
                    return prefix + read(variable, optNode.type, true, isReference);
            }
            let optCode = "";
            optCode += "if (decoder.isNextNil()) {\n";
            optCode += prefix + "null;\n";
            optCode += "} else {\n";
            optCode += read(variable, optNode.type, true, isReference);
            optCode += "}\n";
            return optCode;
        default:
            return "unknown";
    }
}
exports.read = read;
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
function write(typeInst, typeClass, typeMeth, variable, t, prevOptional, isReference) {
    let code = "";
    switch (true) {
        case t instanceof widl_1.Named:
            if (isReference) {
                return `${typeInst}.writeString(${variable});`;
            }
            const namedNode = t;
            if (constant_1.encodeFuncs.has(namedNode.Name.value)) {
                if (prevOptional && constant_1.primitives.has(namedNode.Name.value)) {
                    return `${typeInst}.${constant_1.encodeFuncs.get(namedNode.Name.value)}(${variable}.value);\n`;
                }
                return `${typeInst}.${constant_1.encodeFuncs.get(namedNode.Name.value)}(${variable});\n`;
            }
            return `${variable}.${typeMeth}(${typeInst});\n`;
        case t instanceof widl_1.Map:
            const mappedNode = t;
            code += typeInst + ".write";
            if (prevOptional) {
                code += "Nullable";
            }
            code += "Map(" + variable + ",\n";
            code +=
                "(" +
                    typeInst +
                    ": " +
                    typeClass +
                    ", key: " +
                    exports.expandType(mappedNode.keyType, true, isReference) +
                    " ): void => {\n";
            code += write(typeInst, typeClass, typeMeth, "key", mappedNode.keyType, false, isReference);
            code += "},\n";
            code +=
                "(" +
                    typeInst +
                    ": " +
                    typeClass +
                    ", value: " +
                    exports.expandType(mappedNode.valueType, true, isReference) +
                    " ): void => {\n";
            code += write(typeInst, typeClass, typeMeth, "value", mappedNode.valueType, false, isReference);
            code += "});\n";
            return code;
        case t instanceof widl_1.List:
            const listNode = t;
            code += typeInst + ".write";
            if (prevOptional) {
                code += "Nullable";
            }
            code +=
                "Array(" +
                    variable +
                    ", (" +
                    typeInst +
                    ": " +
                    typeClass +
                    ", item: " +
                    exports.expandType(listNode.type, true, isReference) +
                    " ): void => {\n";
            code += write(typeInst, typeClass, typeMeth, "item", listNode.type, false, isReference);
            code += "});\n";
            return code;
        case t instanceof widl_1.Optional:
            const optionalNode = t;
            switch (true) {
                case t.type instanceof widl_1.List:
                case t.type instanceof widl_1.Map:
                    return write(typeInst, typeClass, typeMeth, variable, optionalNode.type, true, isReference);
            }
            code += "if (" + variable + " === null) {\n";
            code += typeInst + ".writeNil()\n";
            code += "} else {\n";
            code +=
                "const unboxed = " + variable + `${variable != "item" ? "!" : ""}\n`;
            code += write(typeInst, typeClass, typeMeth, "unboxed", optionalNode.type, true, isReference);
            code += "}\n";
            return code;
        default:
            return "unknown";
    }
}
exports.write = write;
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
/**
 * Given an array of OperationDefintion returns them as functions with their arguments
 * @param ops
 */
function opsAsFns(ops) {
    return ops
        .map((op) => {
        return `function ${op.name.value}(${mapArgs(op.arguments)}): ${exports.expandType(op.type, true, isReference(op.annotations))} {\n}`;
    })
        .join("\n");
}
exports.opsAsFns = opsAsFns;
/**
 * returns string of args mapped to their type
 * @param args InputValueDefintion array which is an array of the arguments
 */
function mapArgs(args) {
    return args
        .map((arg) => {
        return mapArg(arg);
    })
        .join(",");
}
exports.mapArgs = mapArgs;
function mapArg(arg) {
    return `${arg.name.value}: ${exports.expandType(arg.type, true, isReference(arg.annotations))}`;
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
        return `${variable}.${arg.name.value}`;
    })
        .join(", ");
}
exports.varAccessArg = varAccessArg;
