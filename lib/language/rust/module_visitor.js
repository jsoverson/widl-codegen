"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleVisitor = void 0;
const widl_1 = require("../../widl");
const _1 = require(".");
class ModuleVisitor extends widl_1.BaseVisitor {
    constructor(writer) {
        super(writer);
        this.setCallback("AllOperationsBefore", "host", (context) => {
            const host = new _1.HostVisitor(writer);
            context.document.accept(context, host);
        });
        this.setCallback("AllOperationsBefore", "handlers", (context) => {
            const handlers = new _1.HandlersVisitor(this.writer);
            context.document.accept(context, handlers);
            // const register = new RegisterVisitor(this.writer);
            // context.interface!.accept(context, register);
        });
        this.setCallback("AllOperationsBefore", "wrappers", (context) => {
            const wrapperVars = new _1.WrapperVarsVisitor(this.writer);
            context.document.accept(context, wrapperVars);
            const wrapperFuncs = new _1.WrapperFuncsVisitor(this.writer);
            context.document.accept(context, wrapperFuncs);
        });
        this.setCallback("OperationAfter", "arguments", (context) => {
            if (context.operation.isUnary()) {
                return;
            }
            const argObject = this.convertOperationToObject(context.operation);
            const struct = new _1.StructVisitor(this.writer);
            argObject.accept(context.clone({ object: argObject }), struct);
        });
        this.setCallback("Object", "struct", (context) => {
            const struct = new _1.StructVisitor(this.writer);
            context.object.accept(context, struct);
        });
    }
    visitDocumentBefore(context) {
        this.write(`extern crate rmp_serde as rmps;
use rmps::{Deserializer, Serializer};
use serde::{Deserialize, Serialize};
use std::io::Cursor;

#[cfg(feature = "guest")]
extern crate wapc_guest as guest;
#[cfg(feature = "guest")]
use guest::prelude::*;

#[cfg(feature = "guest")]
use lazy_static::lazy_static;
#[cfg(feature = "guest")]
use std::sync::RwLock;\n\n`);
        super.triggerDocumentBefore(context);
    }
    visitDocumentAfter(context) {
        super.triggerDocumentAfter(context);
        this.write(`
/// The standard function for serializing codec structs into a format that can be
/// used for message exchange between actor and host. Use of any other function to
/// serialize could result in breaking incompatibilities.
pub fn serialize<T>(
    item: T,
) -> ::std::result::Result<Vec<u8>, Box<dyn std::error::Error + Send + Sync>>
where
    T: Serialize,
{
    let mut buf = Vec::new();
    item.serialize(&mut Serializer::new(&mut buf).with_struct_map())?;
    Ok(buf)
}

/// The standard function for de-serializing codec structs from a format suitable
/// for message exchange between actor and host. Use of any other function to
/// deserialize could result in breaking incompatibilities.
pub fn deserialize<'de, T: Deserialize<'de>>(
    buf: &[u8],
) -> ::std::result::Result<T, Box<dyn std::error::Error + Send + Sync>> {
    let mut de = Deserializer::new(Cursor::new(buf));
    match Deserialize::deserialize(&mut de) {
        Ok(t) => Ok(t),
        Err(e) => Err(format!("Failed to de-serialize: {}", e).into()),
    }
}
\n`);
    }
    convertOperationToObject(operation) {
        var fields = operation.arguments.map((arg) => {
            return new widl_1.FieldDefinition(arg.loc, arg.name, arg.description, arg.type, arg.default, arg.annotations);
        });
        return new widl_1.ObjectDefinition(operation.loc, new widl_1.Name(operation.name.loc, _1.capitalize(operation.name.value) + "Args"), undefined, [], operation.annotations, fields);
    }
}
exports.ModuleVisitor = ModuleVisitor;
