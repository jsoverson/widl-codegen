"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnumValueDefinition = exports.EnumDefinition = exports.UnionDefinition = exports.RoleDefinition = exports.InterfaceDefinition = exports.InputValueDefinition = exports.FieldDefinition = exports.ValuedDefinition = exports.OperationDefinition = exports.ObjectDefinition = exports.NamespaceDefinition = void 0;
const kinds_1 = require("./kinds");
const node_1 = require("./node");
// export class SchemaDefinition extends AbstractNode {
//   annotations: Annotation[];
//   operationTypes: OperationDefinition[];
//   constructor(
//     loc: Location | undefined,
//     annotations: Annotation[],
//     opType: OperationDefinition[]
//   ) {
//     super(kinds.SchemaDefinition, loc);
//     this.annotations = annotations;
//     this.operationTypes = opType;
//   }
// }
// export class OperationTypeDefinition extends AbstractNode {
//   operation: string;
//   type: Named;
//   constructor(loc: Location | undefined, op: string, type: Named) {
//     super(kinds.OperationTypeDefinition, loc);
//     this.operation = op;
//     this.type = type;
//   }
// }
class NamespaceDefinition extends node_1.AbstractNode {
    constructor(loc, desc, name, annotations) {
        super(kinds_1.kinds.NamespaceDefinition, loc);
        this.description = desc;
        this.name = name;
        this.annotations = annotations || [];
    }
    accept(context, visitor) {
        visitor.visitNamespace(context);
    }
}
exports.NamespaceDefinition = NamespaceDefinition;
class ObjectDefinition extends node_1.AbstractNode {
    constructor(loc, name, desc, interfaces, annotations, fields) {
        super(kinds_1.kinds.ObjectDefinition, loc);
        this.name = name;
        this.description = desc;
        this.interfaces = interfaces;
        this.annotations = annotations;
        this.fields = fields;
    }
    accept(context, visitor) {
        visitor.visitObjectBefore(context);
        visitor.visitObject(context);
        context = context.clone({ fields: context.object.fields });
        visitor.visitObjectFieldsBefore(context);
        context.fields.map((field, index) => {
            field.accept(context.clone({ field: field, fieldIndex: index }), visitor);
        });
        visitor.visitObjectFieldsAfter(context);
        visitor.visitObjectAfter(context);
    }
}
exports.ObjectDefinition = ObjectDefinition;
class OperationDefinition extends node_1.AbstractNode {
    constructor(loc, name, desc, args, type, annotations, unary) {
        super(kinds_1.kinds.OperationDefinition, loc);
        this.name = name;
        this.description = desc;
        this.arguments = args;
        this.type = type;
        this.annotations = annotations;
        this.unary = unary;
    }
    isUnary() {
        return this.unary && this.arguments && this.arguments.length == 1;
    }
    unaryOp() {
        return this.arguments[0];
    }
    mapTypeToTranslation(typeTranslation) {
        const mp = new Map();
        if (this.unary) {
            mp.set(this.unaryOp().name.value, typeTranslation(this.unaryOp().type));
        }
        else {
            this.arguments.forEach((arg) => {
                mp.set(arg.name.value, typeTranslation(arg.type));
            });
        }
        return mp;
    }
    accept(context, visitor) {
        visitor.visitOperationBefore(context);
        visitor.visitOperation(context);
        context = context.clone({ argumentsDef: context.operation.arguments });
        visitor.visitArgumentsBefore(context);
        context.argumentsDef.map((argument, index) => {
            argument.accept(context.clone({ argument: argument, argumentIndex: index }), visitor);
        });
        visitor.visitArgumentsAfter(context);
        visitor.visitOperationAfter(context);
    }
}
exports.OperationDefinition = OperationDefinition;
class ValuedDefinition extends node_1.AbstractNode {
    constructor(kinds, loc, name, desc, type, defaultVal, annotations) {
        super(kinds, loc);
        this.name = name;
        this.description = desc;
        this.type = type;
        this.default = defaultVal;
        this.annotations = annotations;
    }
}
exports.ValuedDefinition = ValuedDefinition;
class FieldDefinition extends ValuedDefinition {
    constructor(loc, name, desc, type, defaultVal, annotations) {
        super(kinds_1.kinds.FieldDefinition, loc, name, desc, type, defaultVal, annotations);
    }
    accept(context, visitor) {
        visitor.visitObjectField(context);
    }
}
exports.FieldDefinition = FieldDefinition;
class InputValueDefinition extends ValuedDefinition {
    constructor(loc, name, desc, type, defaultVal, annotations) {
        super(kinds_1.kinds.FieldDefinition, loc, name, desc, type, defaultVal, annotations);
    }
    accept(context, visitor) {
        visitor.visitArgument(context);
    }
}
exports.InputValueDefinition = InputValueDefinition;
class InterfaceDefinition extends node_1.AbstractNode {
    constructor(loc, desc, op, annotations) {
        super(kinds_1.kinds.InterfaceDefinition, loc);
        this.description = desc;
        this.operations = op || [];
        this.annotations = annotations || [];
    }
    accept(context, visitor) {
        visitor.visitInterfaceBefore(context);
        visitor.visitInterface(context);
        context = context.clone({ operations: context.interface.operations });
        visitor.visitOperationsBefore(context);
        context.operations.map((operation) => {
            operation.accept(context.clone({ operation: operation }), visitor);
        });
        visitor.visitOperationsAfter(context);
        visitor.visitInterfaceAfter(context);
    }
}
exports.InterfaceDefinition = InterfaceDefinition;
class RoleDefinition extends node_1.AbstractNode {
    constructor(loc, name, desc, op, annotations) {
        super(kinds_1.kinds.RoleDefinition, loc);
        this.name = name;
        this.description = desc;
        this.operations = op || [];
        this.annotations = annotations || [];
    }
    accept(context, visitor) {
        var _a;
        visitor.visitRoleBefore(context);
        visitor.visitRole(context);
        context = context.clone({ operations: (_a = context.role) === null || _a === void 0 ? void 0 : _a.operations });
        visitor.visitOperationsBefore(context);
        context.operations.map((operation) => {
            operation.accept(context.clone({ operation: operation }), visitor);
        });
        visitor.visitOperationsAfter(context);
        visitor.visitRoleAfter(context);
    }
}
exports.RoleDefinition = RoleDefinition;
class UnionDefinition extends node_1.AbstractNode {
    constructor(loc, name, desc, annotations, types) {
        super(kinds_1.kinds.UnionDefinition, loc);
        this.name = name;
        this.description = desc;
        this.annotations = annotations;
        this.types = types;
    }
}
exports.UnionDefinition = UnionDefinition;
class EnumDefinition extends node_1.AbstractNode {
    constructor(loc, name, desc, annotations, values) {
        super(kinds_1.kinds.EnumDefinition, loc);
        this.name = name;
        this.description = desc;
        this.annotations = annotations;
        this.values = values;
    }
}
exports.EnumDefinition = EnumDefinition;
class EnumValueDefinition extends node_1.AbstractNode {
    constructor(loc, name, desc, annotations) {
        super(kinds_1.kinds.EnumValueDefinition, loc);
        this.name = name;
        this.description = desc;
        this.annotations = annotations;
    }
}
exports.EnumValueDefinition = EnumValueDefinition;
