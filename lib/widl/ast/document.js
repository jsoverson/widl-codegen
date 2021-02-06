"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Document = void 0;
const kinds_1 = require("./kinds");
const node_1 = require("./node");
const visitor_1 = require("./visitor");
class Document extends node_1.AbstractNode {
    constructor(loc, definitions) {
        super(kinds_1.kinds.Document, loc);
        this.definitions = definitions;
    }
    accept(context, visitor) {
        context = new visitor_1.Context(context.config, this);
        visitor.visitDocumentBefore(context);
        context.namespace.accept(context, visitor);
        visitor.visitAllOperationsBefore(context);
        context.interface.accept(context, visitor);
        visitor.visitRolesBefore(context);
        context.roles.map((role) => {
            role.accept(context.clone({ role: role }), visitor);
        });
        visitor.visitRolesAfter(context);
        visitor.visitAllOperationsAfter(context);
        visitor.visitObjectsBefore(context);
        context.objects.map((object) => {
            object.accept(context.clone({ object: object }), visitor);
        });
        visitor.visitObjectsAfter(context);
        visitor.visitDocumentAfter(context);
    }
}
exports.Document = Document;
