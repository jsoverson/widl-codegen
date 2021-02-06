import fs from "fs";
import prettier from "prettier";
import child_process from "child_process";
import { parse, Context, Writer } from "./widl";
import {
  ModuleVisitor as ASModuleVisitor,
  ScaffoldVisitor as ASScaffoldVisitor,
} from "./language/assemblyscript";
import {
  ModuleVisitor as TinyGoModuleVisitor,
  ScaffoldVisitor as TinyGoScaffoldVisitor,
} from "./language/tinygo";
import { ModuleVisitor as GoModuleVisitor } from "./language/go";
import {
  ModuleVisitor as RustModuleVisitor,
  ScaffoldVisitor as RustScaffoldVisitor,
} from "./language/rust";

const args = process.argv.slice(2);
if (args.length < 2) {
  console.log("usage: widl-codegen <input> <language...>");
  process.exit(1);
}
const input = args[0];
const languages = args.slice(1);

fs.readFile(input, "utf8", async function (err, data) {
  if (err) {
    throw err;
  }
  const doc = parse(data);
  const context = new Context({
    import: "github.com/wapc/languages-tests/tinygo/module",
    module: "module",
    handlerRoles: ["Function"],
    hostRoles: ["Unary2"],
    skipInterface: true,
  });

  languages.forEach((lang) => {
    switch (lang) {
      case "assemblyscript":
        {
          const writer = new Writer();
          const visitor = new ASModuleVisitor(writer);
          doc.accept(context, visitor);
          let source = writer.string();
          source = formatAssemblyScript(source);
          fs.writeFileSync("module.ts", source);
        }
        {
          const writer = new Writer();
          const visitor = new ASScaffoldVisitor(writer);
          doc.accept(context, visitor);
          let source = writer.string();
          source = formatAssemblyScript(source);
          fs.writeFileSync("index.ts", source);
        }
        break;
      case "tinygo":
        {
          const writer = new Writer();
          const visitor = new TinyGoModuleVisitor(writer);
          doc.accept(context, visitor);
          let source = writer.string();
          fs.writeFileSync("module.go", source);
          formatGolang("module.go");
        }
        {
          const writer = new Writer();
          const visitor = new TinyGoScaffoldVisitor(writer);
          doc.accept(context, visitor);
          let source = writer.string();
          fs.writeFileSync("main.go", source);
          formatGolang("main.go");
        }
        break;
      case "go":
        {
          const writer = new Writer();
          const visitor = new GoModuleVisitor(writer);
          doc.accept(context, visitor);
          let source = writer.string();
          fs.writeFileSync("module2.go", source);
          formatGolang("module2.go");
        }
        break;
      case "rust":
        {
          const writer = new Writer();
          const visitor = new RustModuleVisitor(writer);
          doc.accept(context, visitor);
          let source = writer.string();
          fs.writeFileSync("generated.rs", source);
          formatRust("generated.rs");
        }
        {
          const writer = new Writer();
          const visitor = new RustScaffoldVisitor(writer);
          doc.accept(context, visitor);
          let source = writer.string();
          fs.writeFileSync("lib.rs", source);
          formatRust("lib.rs");
        }
        break;
    }
  });
});

function formatAssemblyScript(source: string): string {
  try {
    source = prettier.format(source, {
      semi: true,
      parser: "typescript",
    });
  } catch (err) {}
  return source;
}

function formatGolang(filename: string): void {
  child_process.execSync("go fmt " + filename);
}

function formatRust(filename: string): void {
  child_process.execSync("rustfmt " + filename);
}
