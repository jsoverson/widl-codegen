import { Context, Writer, BaseVisitor } from "../../widl";
import {
  expandType,
  isReference,
  strQuote,
  capitalize,
  fieldName,
  isVoid,
} from ".";
import { functionName } from "./helpers";

export class HostVisitor extends BaseVisitor {
  constructor(writer: Writer) {
    super(writer);
  }

  visitInterfaceBefore(context: Context): void {
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

  visitOperation(context: Context): void {
    const operation = context.operation!;
    this.write(`\npub fn ${functionName(operation.name.value)}(&self`);
    operation.arguments.map((arg, index) => {
      this.write(
        `, ${arg.name.value}: ${expandType(arg.type, undefined, false, false)}`
      );
    });
    this.write(`) `);
    const retVoid = isVoid(operation.type);
    if (!retVoid) {
      this.write(
        `-> HandlerResult<${expandType(
          operation.type,
          undefined,
          false,
          false
        )}>`
      );
    } else {
      this.write(`-> HandlerResult<()>`);
    }
    this.write(` {\n`);

    if (operation.isUnary()) {
      this.write(
        `host_call(
        &self.binding, 
        ${strQuote(context.namespace.name.value)},
        ${strQuote(operation.name.value)},
        &serialize(${operation.unaryOp().name.value})?,
        )\n`
      );
    } else {
      this.write(`let input_args = ${capitalize(operation.name.value)}Args{\n`);
      operation.arguments.map((arg) => {
        const argName = arg.name.value;
        this.write(`  ${fieldName(argName)}: ${argName},\n`);
      });
      this.write(`};\n`);
      this.write(`host_call(
      &self.binding, 
      ${strQuote(context.namespace.name.value)},
      ${strQuote(operation.name.value)},
      &serialize(input_args)?,
    )\n`);
    }
    if (!retVoid) {
      this.write(`.map(|vec| {
        let resp = deserialize::<${expandType(
          operation.type,
          undefined,
          false,
          isReference(operation.annotations)
        )}>(vec.as_ref()).unwrap();
        resp
      })\n`);
    } else {
      this.write(`.map(|_vec| ())\n`);
    }
    this.write(`.map_err(|e| e.into())
    }\n`);
    super.triggerOperation(context);
  }

  visitInterfaceAfter(context: Context): void {
    super.triggerInterfaceAfter(context);
    this.write(`}\n\n`);
  }
}
