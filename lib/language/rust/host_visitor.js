"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HostVisitor = void 0;
const widl_1 = require("../../widl");
const _1 = require(".");
const helpers_1 = require("./helpers");
class HostVisitor extends widl_1.BaseVisitor {
    constructor(writer) {
        super(writer);
    }
    visitInterfaceBefore(context) {
        super.triggerInterfaceBefore(context);
        this.write(`pub struct Host {
    binding: String,
}

impl Default for Host {
    fn default() -> Self {
        Host {
            binding: "default".to_string(),
        }
    }
}

/// Creates a named host binding
pub fn host(binding: &str) -> Host {
    Host {
        binding: binding.to_string(),
    }
}

/// Creates the default host binding
pub fn default() -> Host {
    Host::default()
}

impl Host {`);
    }
    visitOperation(context) {
        const operation = context.operation;
        this.write(`\npub fn ${helpers_1.functionName(operation.name.value)}(&self`);
        operation.arguments.map((arg, index) => {
            this.write(`, ${_1.fieldName(arg.name.value)}: ${_1.expandType(arg.type, undefined, false, false)}`);
        });
        this.write(`) `);
        const retVoid = _1.isVoid(operation.type);
        if (!retVoid) {
            this.write(`-> HandlerResult<${_1.expandType(operation.type, undefined, false, false)}>`);
        }
        else {
            this.write(`-> HandlerResult<()>`);
        }
        this.write(` {\n`);
        if (operation.isUnary()) {
            this.write(`host_call(
        &self.binding, 
        ${_1.strQuote(context.namespace.name.value)},
        ${_1.strQuote(operation.name.value)},
        &serialize(${operation.unaryOp().name.value})?,
        )\n`);
        }
        else {
            this.write(`let input_args = ${_1.capitalize(operation.name.value)}Args{\n`);
            operation.arguments.map((arg) => {
                const argName = arg.name.value;
                this.write(`  ${_1.fieldName(argName)},\n`);
            });
            this.write(`};\n`);
            this.write(`host_call(
      &self.binding, 
      ${_1.strQuote(context.namespace.name.value)},
      ${_1.strQuote(operation.name.value)},
      &serialize(input_args)?,
    )\n`);
        }
        if (!retVoid) {
            this.write(`.map(|vec| {
        let resp = deserialize::<${_1.expandType(operation.type, undefined, false, _1.isReference(operation.annotations))}>(vec.as_ref()).unwrap();
        resp
      })\n`);
        }
        else {
            this.write(`.map(|_vec| ())\n`);
        }
        this.write(`.map_err(|e| e.into())
    }\n`);
        super.triggerOperation(context);
    }
    visitInterfaceAfter(context) {
        super.triggerInterfaceAfter(context);
        this.write(`}\n\n`);
    }
}
exports.HostVisitor = HostVisitor;
