import {
  BaseVisitor,
  Context,
  Writer,
  OperationDefinition,
  ObjectDefinition,
  FieldDefinition,
  Name,
} from "../../widl";
import {
  capitalize,
  HandlersVisitor,
  HostVisitor,
  StructVisitor,
  WrapperFuncsVisitor,
  WrapperVarsVisitor,
} from ".";

export class ModuleVisitor extends BaseVisitor {
  constructor(writer: Writer) {
    super(writer);
    this.setCallback("Interface", "host", (context: Context): void => {
      const host = new HostVisitor(writer);
      context.interface!.accept(context, host);
    });
    this.setCallback("Interface", "handlers", (context: Context): void => {
      const handlers = new HandlersVisitor(this.writer);
      context.interface!.accept(context, handlers);
      // const register = new RegisterVisitor(this.writer);
      // context.interface!.accept(context, register);
    });
    this.setCallback("Interface", "wrappers", (context: Context): void => {
      const wrapperVars = new WrapperVarsVisitor(this.writer);
      context.interface!.accept(context, wrapperVars);
      const wrapperFuncs = new WrapperFuncsVisitor(this.writer);
      context.interface!.accept(context, wrapperFuncs);
    });
    this.setCallback(
      "OperationAfter",
      "arguments",
      (context: Context): void => {
        if (context.operation!.isUnary()) {
          return;
        }
        const argObject = this.convertOperationToObject(context.operation!);
        const struct = new StructVisitor(this.writer);
        argObject.accept(context.clone({ object: argObject }), struct);
      }
    );
    this.setCallback("Object", "struct", (context: Context): void => {
      const struct = new StructVisitor(this.writer);
      context.object!.accept(context, struct);
    });
  }

  visitDocumentBefore(context: Context): void {
    this.write(`extern crate rmp_serde as rmps;
use rmps::{Deserializer, Serializer};
use serde::{Deserialize, Serialize};
use std::io::Cursor;

extern crate log;
extern crate wapc_guest as guest;
use guest::prelude::*;

use lazy_static::lazy_static;
use std::sync::RwLock;\n\n`);
    super.triggerDocumentBefore(context);
  }

  visitDocumentAfter(context: Context): void {
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

  private convertOperationToObject(
    operation: OperationDefinition
  ): ObjectDefinition {
    var fields = operation.arguments.map((arg) => {
      return new FieldDefinition(
        arg.loc,
        arg.name,
        arg.description,
        arg.type,
        arg.default,
        arg.annotations
      );
    });
    return new ObjectDefinition(
      operation.loc,
      new Name(operation.name.loc, capitalize(operation.name.value) + "Args"),
      undefined,
      [],
      operation.annotations,
      fields
    );
  }
}
