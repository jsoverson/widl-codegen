"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.varAccessArg = exports.isNode = exports.mapArg = exports.mapArgs = exports.opsAsFns = exports.fieldName = exports.capitalize = exports.isReference = exports.isObject = exports.isVoid = exports.write = exports.read = exports.expandType = exports.strQuote = exports.defaultValueForType = exports.defValue = exports.encode = exports.size = exports.mapVals = void 0;
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
        .map((vd) => `${vd.name.value}${sep} ${exports.expandType(vd.type, undefined, true, isReference(vd.annotations))}`)
        .join(joinOn);
}
exports.mapVals = mapVals;
/**
 * Creates string that is an msgpack size code block
 * @param variable variable that is being size
 * @param t the type node to encode
 * @param isReference if the type that is being expanded has a `@ref` annotation
 */
function size(typeInstRef, variable, t, isReference) {
    return write("sizer", typeInstRef, "Writer", "Encode", variable, t, false, isReference);
}
exports.size = size;
/**
 * Creates string that is an msgpack encode code block
 * @param variable variable that is being encode
 * @param t the type node to encode
 * @param isReference if the type that is being expanded has a `@ref` annotation
 */
function encode(typeInstRef, variable, t, isReference) {
    return write("encoder", typeInstRef, "Writer", "Encode", variable, t, false, isReference);
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
            return "nil";
        case widl_1.List:
        case widl_1.Map:
            return `new ${exports.expandType(type, undefined, false, isReference(fieldDef.annotations))}()`;
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
                    return "[]byte{}";
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
            return "nil";
        case widl_1.List:
        case widl_1.Map:
            return `${exports.expandType(type, packageName, false, false)}{}`;
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
                    return "[]byte{}";
                default:
                    const prefix = packageName != undefined && packageName != ""
                        ? packageName + "."
                        : "";
                    return `${prefix}${capitalize(type.Name.value)}{}`; // reference to something else
            }
    }
    return "???";
}
exports.defaultValueForType = defaultValueForType;
/**
 * returns string in quotes
 * @param s string to have quotes
 */
const strQuote = (s) => {
    return `\"${s}\"`;
};
exports.strQuote = strQuote;
/**
 * returns string of the expanded type of a node
 * @param type the type node that is being expanded
 * @param useOptional if the type that is being expanded is optional
 * @param isReference if the type that is being expanded has a `@ref` annotation
 */
const expandType = (type, packageName, useOptional, isReference) => {
    switch (true) {
        case type instanceof widl_1.Named:
            if (isReference) {
                return "string";
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
            return `map[${exports.expandType(type.keyType, packageName, true, isReference)}]${exports.expandType(type.valueType, packageName, true, isReference)}`;
        case type instanceof widl_1.List:
            return `[]${exports.expandType(type.type, packageName, true, isReference)}`;
        case type instanceof widl_1.Optional:
            const nestedType = type.type;
            let expanded = exports.expandType(nestedType, packageName, true, isReference);
            if (useOptional &&
                !(nestedType instanceof widl_1.Map ||
                    nestedType instanceof widl_1.List ||
                    expanded == "[]byte")) {
                return `*${expanded}`;
            }
            return expanded;
        default:
            return "unknown";
    }
};
exports.expandType = expandType;
/**
 * Creates string that is an msgpack read code block
 * @param variable variable that is being read
 * @param t the type node to write
 * @param prevOptional if type is being expanded and the parent type is optional
 * @param isReference if the type that is being expanded has a `@ref` annotation
 */
function read(typeInstRef, variable, errorHandling, defaultVal, t, prevOptional, isReference) {
    const returnPrefix = defaultVal == "" ? "" : `${defaultVal}, `;
    let prefix = "return ";
    if (variable != "") {
        if (variable == "item" ||
            variable == "key" ||
            variable == "value" ||
            variable == "ret") {
            if (errorHandling) {
                prefix = variable + ", err := ";
            }
            else {
                prefix = variable + " := ";
            }
        }
        else {
            if (errorHandling) {
                prefix = variable + ", err = ";
            }
            else {
                prefix = variable + " = ";
            }
        }
    }
    switch (true) {
        case t instanceof widl_1.Named:
            let namedNode = t;
            const amp = typeInstRef ? "&" : "";
            let decodeFn = `Decode${namedNode.Name.value}(${amp}decoder)`;
            if (isReference) {
                decodeFn = `decoder.ReadString()`;
            }
            else if (constant_1.decodeFuncs.has(namedNode.Name.value)) {
                decodeFn = `decoder.${constant_1.decodeFuncs.get(namedNode.Name.value)}()`;
            }
            if (prevOptional) {
                return `nonNil, err = ${decodeFn}
        ${prefix}${namedNode.Name.value == "bytes" ? "" : "&"}nonNil\n`;
            }
            return `${prefix}${decodeFn}\n`;
        case t instanceof widl_1.Map:
            let mapCode = `mapSize, err := decoder.ReadMapSize()
      if err != nil {
        return ${returnPrefix}err
      }\n`;
            if (variable == "ret") {
                mapCode += "ret :=";
            }
            else {
                mapCode += `${variable} = `;
            }
            mapCode += `make(map[${exports.expandType(t.keyType, undefined, true, isReference)}]${exports.expandType(t.valueType, undefined, true, isReference)}, mapSize)\n`;
            mapCode += `for mapSize > 0 {
        mapSize--\n`;
            mapCode += read(typeInstRef, "key", true, defaultVal, t.keyType, false, isReference);
            if (!mapCode.endsWith(`\n`)) {
                mapCode += `\n`;
            }
            mapCode += `if err != nil {
          return ${returnPrefix}err
        }\n`;
            mapCode += read(typeInstRef, "value", true, defaultVal, t.valueType, false, isReference);
            if (!mapCode.endsWith(`\n`)) {
                mapCode += `\n`;
            }
            mapCode += `if err != nil {
          return ${returnPrefix}err
        }\n`;
            mapCode += `${variable}[key] = value
      }\n`;
            return mapCode;
        case t instanceof widl_1.List:
            let listCode = `listSize, err := decoder.ReadArraySize()
      if err != nil {
        return ${returnPrefix}err
      }\n`;
            if (variable == "ret") {
                listCode += "ret :=";
            }
            else {
                listCode += `${variable} = `;
            }
            listCode += `make([]${exports.expandType(t.type, undefined, true, isReference)}, 0, listSize)\n`;
            listCode += `for listSize > 0 {
        listSize--
        var nonNilItem ${t.type instanceof widl_1.Optional ? "*" : ""}${exports.expandType(t.type, undefined, false, isReference)}\n`;
            listCode += read(typeInstRef, "nonNilItem", true, defaultVal, t.type, false, isReference);
            if (!listCode.endsWith(`\n`)) {
                listCode += `\n`;
            }
            listCode += `if err != nil {
          return ${returnPrefix}err
        }\n`;
            listCode += `${variable} = append(${variable}, nonNilItem)
      }\n`;
            return listCode;
        case t instanceof widl_1.Optional:
            const optNode = t;
            optNode.type;
            switch (true) {
                case optNode.type instanceof widl_1.List:
                case optNode.type instanceof widl_1.Map:
                    return (prefix +
                        read(typeInstRef, variable, false, defaultVal, optNode.type, true, isReference));
            }
            let optCode = "";
            optCode += "isNil, err := decoder.IsNextNil()\n";
            optCode += "if err == nil {\n";
            optCode += "if isNil {\n";
            optCode += prefix.replace(", err", "") + "nil;\n";
            optCode += "} else {\n";
            optCode += `var nonNil ${exports.expandType(optNode.type, "", false, isReference)}\n`;
            optCode += read(typeInstRef, variable, false, defaultVal, optNode.type, true, isReference);
            optCode += "}\n";
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
function write(typeInst, typeInstRef, typeClass, typeMeth, variable, t, prevOptional, isReference) {
    let code = "";
    switch (true) {
        case t instanceof widl_1.Named:
            if (isReference) {
                return `${typeInst}.WriteString(${variable})`;
            }
            const namedNode = t;
            if (constant_1.encodeFuncs.has(namedNode.Name.value)) {
                return `${typeInst}.${constant_1.encodeFuncs.get(namedNode.Name.value)}(${variable})\n`;
            }
            const amp = typeInstRef ? "&" : "";
            return `${variable}.${typeMeth}(${amp}${typeInst})\n`;
        case t instanceof widl_1.Map:
            const mappedNode = t;
            code +=
                typeInst +
                    `.WriteMapSize(uint32(len(${variable})))
      if ${variable} != nil { // TinyGo bug: ranging over nil maps panics.
      for k, v := range ${variable} {
        ${write(typeInst, typeInstRef, typeClass, typeMeth, "k", mappedNode.keyType, false, isReference)}${write(typeInst, typeInstRef, typeClass, typeMeth, "v", mappedNode.valueType, false, isReference)}}
      }\n`;
            return code;
        case t instanceof widl_1.List:
            const listNode = t;
            code +=
                typeInst +
                    `.WriteArraySize(uint32(len(${variable})))
      for _, v := range ${variable} {
        ${write(typeInst, typeInstRef, typeClass, typeMeth, "v", listNode.type, false, isReference)}}\n`;
            return code;
        case t instanceof widl_1.Optional:
            const optionalNode = t;
            switch (true) {
                case t.type instanceof widl_1.List:
                case t.type instanceof widl_1.Map:
                    return write(typeInst, typeInstRef, typeClass, typeMeth, variable, optionalNode.type, true, isReference);
            }
            code += "if " + variable + " == nil {\n";
            code += typeInst + ".WriteNil()\n";
            code += "} else {\n";
            let vprefix = "";
            if (!isObject(optionalNode.type)) {
                vprefix = "*";
            }
            code += write(typeInst, typeInstRef, typeClass, typeMeth, vprefix + variable, optionalNode.type, true, isReference);
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
function fieldName(str) {
    str = capitalize(str);
    if (str.endsWith("Id")) {
        str = str.substring(0, str.length - 2) + "ID";
    }
    return str;
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
function mapArgs(args, packageName) {
    return args
        .map((arg) => {
        return mapArg(arg, packageName);
    })
        .join(", ");
}
exports.mapArgs = mapArgs;
function mapArg(arg, packageName) {
    return `${arg.name.value} ${exports.expandType(arg.type, packageName, true, isReference(arg.annotations))}`;
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
        return `${variable}.${fieldName(arg.name.value)}`;
    })
        .join(", ");
}
exports.varAccessArg = varAccessArg;
