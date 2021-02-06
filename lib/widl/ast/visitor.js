"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseVisitor = exports.AbstractVisitor = exports.Context = exports.Writer = void 0;
const __1 = require("../");
const auto_bind_1 = __importDefault(require("auto-bind"));
class Writer {
    constructor() {
        this.code = "";
    }
    write(source) {
        this.code += source;
    }
    string() {
        return this.code;
    }
}
exports.Writer = Writer;
class Context {
    constructor(config, document, other) {
        this.config = config || {};
        if (other != undefined) {
            this.document = other.document;
            this.namespace = other.namespace;
            this.interface = other.interface;
            this.roles = other.roles;
            this.enums = other.enums;
            this.objects = other.objects;
            this.unions = other.unions;
            this.inputs = other.inputs;
        }
        else {
            this.namespace = new __1.NamespaceDefinition(undefined, undefined, new __1.Name(undefined, ""));
            this.interface = new __1.InterfaceDefinition();
            this.roles = new Array();
            this.enums = new Array();
            this.objects = new Array();
            this.unions = new Array();
            this.inputs = new Array();
        }
        if (document != undefined) {
            this.document = document;
            this.parseDocument();
        }
        auto_bind_1.default(this);
    }
    clone({ role, object, operations, operation, argumentsDef, argument, argumentIndex, fields, field, fieldIndex, enumDef, enumValues, enumValue, union, input, annotations, annotation, }) {
        var context = new Context(this.config, undefined, this);
        context.role = role || this.role;
        context.object = object || this.object;
        context.operations = operations || this.operations;
        context.operation = operation || this.operation;
        context.argumentsDef = argumentsDef || this.argumentsDef;
        context.argument = argument || this.argument;
        context.argumentIndex = argumentIndex || this.argumentIndex;
        context.fields = fields || this.fields;
        context.field = field || this.field;
        context.fieldIndex = fieldIndex || this.fieldIndex;
        context.enum = enumDef || this.enum;
        context.enumValues = enumValues || this.enumValues;
        context.enumValue = enumValue || this.enumValue;
        context.union = union || this.union;
        context.input = input || this.input;
        context.annotations = annotations || this.annotations;
        context.annotation = annotation || this.annotation;
        return context;
    }
    parseDocument() {
        this.document.definitions.forEach((value) => {
            switch (true) {
                case value instanceof __1.NamespaceDefinition:
                    this.namespace = value;
                    break;
                case value instanceof __1.InterfaceDefinition:
                    this.interface = value;
                    break;
                case value instanceof __1.RoleDefinition:
                    this.roles.push(value);
                    break;
                case value instanceof __1.ObjectDefinition:
                    this.objects.push(value);
                    break;
                case value instanceof __1.EnumDefinition:
                    this.enums.push(value);
                    break;
                case value instanceof __1.UnionDefinition:
                    this.unions.push(value);
                    break;
                case value instanceof __1.InputValueDefinition:
                    this.inputs.push(value);
                    break;
            }
        });
    }
}
exports.Context = Context;
class AbstractVisitor {
    constructor() {
        this.callbacks = new Map();
        //public visitUnion(context: Context): void {}
        //public visitInput(context: Context): void {}
    }
    setCallback(phase, purpose, callback) {
        var purposes = this.callbacks.get(phase);
        if (purposes == undefined) {
            purposes = new Map();
            this.callbacks.set(phase, purposes);
        }
        purposes.set(purpose, callback);
    }
    triggerCallbacks(context, phase) {
        var purposes = this.callbacks.get(phase);
        if (purposes == undefined) {
            return;
        }
        purposes.forEach((callback) => {
            callback(context);
        });
    }
    visitDocumentBefore(context) {
        this.triggerDocumentBefore(context);
    }
    triggerDocumentBefore(context) {
        this.triggerCallbacks(context, "DocumentBefore");
    }
    visitNamespace(context) {
        this.triggerNamespace(context);
    }
    triggerNamespace(context) {
        this.triggerCallbacks(context, "Namespace");
    }
    visitAllOperationsBefore(context) {
        this.triggerAllOperationsBefore(context);
    }
    triggerAllOperationsBefore(context) {
        this.triggerCallbacks(context, "AllOperationsBefore");
    }
    visitInterfaceBefore(context) {
        this.triggerInterfaceBefore(context);
    }
    triggerInterfaceBefore(context) {
        this.triggerCallbacks(context, "InterfaceBefore");
    }
    visitInterface(context) {
        this.triggerInterface(context);
    }
    triggerInterface(context) {
        this.triggerCallbacks(context, "Interface");
    }
    visitRolesBefore(context) {
        this.triggerRolesBefore(context);
    }
    triggerRolesBefore(context) {
        this.triggerCallbacks(context, "RolesBefore");
    }
    visitRoleBefore(context) {
        this.triggerRoleBefore(context);
    }
    triggerRoleBefore(context) {
        this.triggerCallbacks(context, "RoleBefore");
    }
    visitRole(context) {
        this.triggerRole(context);
    }
    triggerRole(context) {
        this.triggerCallbacks(context, "Role");
    }
    visitOperationsBefore(context) {
        this.triggerOperationsBefore(context);
    }
    triggerOperationsBefore(context) {
        this.triggerCallbacks(context, "OperationsBefore");
    }
    visitOperationBefore(context) {
        this.triggerOperationBefore(context);
    }
    triggerOperationBefore(context) {
        this.triggerCallbacks(context, "OperationBefore");
    }
    visitOperation(context) {
        this.triggerOperation(context);
    }
    triggerOperation(context) {
        this.triggerCallbacks(context, "Operation");
    }
    visitArgumentsBefore(context) {
        this.triggerArgumentsBefore(context);
    }
    triggerArgumentsBefore(context) {
        this.triggerCallbacks(context, "ArgumentsBefore");
    }
    visitArgument(context) {
        this.triggerArgument(context);
    }
    triggerArgument(context) {
        this.triggerCallbacks(context, "Argument");
    }
    visitArgumentsAfter(context) {
        this.triggerArgumentsAfter(context);
    }
    triggerArgumentsAfter(context) {
        this.triggerCallbacks(context, "ArgumentsAfter");
    }
    visitOperationAfter(context) {
        this.triggerOperationAfter(context);
    }
    triggerOperationAfter(context) {
        this.triggerCallbacks(context, "OperationAfter");
    }
    visitOperationsAfter(context) {
        this.triggerOperationsAfter(context);
    }
    triggerOperationsAfter(context) {
        this.triggerCallbacks(context, "OperationsAfter");
    }
    visitInterfaceAfter(context) {
        this.triggerInterfaceAfter(context);
    }
    triggerInterfaceAfter(context) {
        this.triggerCallbacks(context, "InterfaceAfter");
    }
    visitRoleAfter(context) {
        this.triggerRoleAfter(context);
    }
    triggerRoleAfter(context) {
        this.triggerCallbacks(context, "RoleAfter");
    }
    visitRolesAfter(context) {
        this.triggerRolesAfter(context);
    }
    triggerRolesAfter(context) {
        this.triggerCallbacks(context, "RolesAfter");
    }
    visitAllOperationsAfter(context) {
        this.triggerAllOperationsAfter(context);
    }
    triggerAllOperationsAfter(context) {
        this.triggerCallbacks(context, "AllOperationsAfter");
    }
    visitObjectsBefore(context) {
        this.triggerObjectsBefore(context);
    }
    triggerObjectsBefore(context) {
        this.triggerCallbacks(context, "ObjectsBefore");
    }
    visitObjectBefore(context) {
        this.triggerObjectBefore(context);
    }
    triggerObjectBefore(context) {
        this.triggerCallbacks(context, "ObjectBefore");
    }
    visitObject(context) {
        this.triggerObject(context);
    }
    triggerObject(context) {
        this.triggerCallbacks(context, "Object");
    }
    visitObjectFieldsBefore(context) {
        this.triggerObjectFieldsBefore(context);
    }
    triggerObjectFieldsBefore(context) {
        this.triggerCallbacks(context, "ObjectFieldsBefore");
    }
    visitObjectField(context) {
        this.triggerObjectField(context);
    }
    triggerObjectField(context) {
        this.triggerCallbacks(context, "ObjectField");
    }
    visitObjectFieldsAfter(context) {
        this.triggerObjectFieldsAfter(context);
    }
    triggerObjectFieldsAfter(context) {
        this.triggerCallbacks(context, "ObjectFieldsAfter");
    }
    visitObjectAfter(context) {
        this.triggerObjectAfter(context);
    }
    triggerObjectAfter(context) {
        this.triggerCallbacks(context, "ObjectAfter");
    }
    visitObjectsAfter(context) {
        this.triggerObjectsAfter(context);
    }
    triggerObjectsAfter(context) {
        this.triggerCallbacks(context, "ObjectsAfter");
    }
    visitEnumsBefore(context) {
        this.triggerEnumsBefore(context);
    }
    triggerEnumsBefore(context) {
        this.triggerCallbacks(context, "EnumsBefore");
    }
    visitEnum(context) {
        this.triggerEnum(context);
    }
    triggerEnum(context) {
        this.triggerCallbacks(context, "Enum");
    }
    visitEnumValuesBefore(context) {
        this.triggerEnumValuesBefore(context);
    }
    triggerEnumValuesBefore(context) {
        this.triggerCallbacks(context, "EnumValuesBefore");
    }
    visitEnumValue(context) {
        this.triggerEnumValue(context);
    }
    triggerEnumValue(context) {
        this.triggerCallbacks(context, "EnumValue");
    }
    visitEnumValuesAfter(context) {
        this.triggerEnumValuesAfter(context);
    }
    triggerEnumValuesAfter(context) {
        this.triggerCallbacks(context, "EnumValuesAfter");
    }
    visitEnumsAfter(context) {
        this.triggerEnumsAfter(context);
    }
    triggerEnumsAfter(context) {
        this.triggerCallbacks(context, "EnumsAfter");
    }
    visitDocumentAfter(context) {
        this.triggerDocumentAfter(context);
    }
    triggerDocumentAfter(context) {
        this.triggerCallbacks(context, "DocumentAfter");
    }
}
exports.AbstractVisitor = AbstractVisitor;
class BaseVisitor extends AbstractVisitor {
    constructor(writer) {
        super();
        this.writer = writer;
    }
    write(code) {
        this.writer.write(code);
    }
}
exports.BaseVisitor = BaseVisitor;
