"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const prettier_1 = __importDefault(require("prettier"));
const child_process_1 = __importDefault(require("child_process"));
const widl_1 = require("./widl");
const assemblyscript_1 = require("./language/assemblyscript");
const tinygo_1 = require("./language/tinygo");
const go_1 = require("./language/go");
const rust_1 = require("./language/rust");
const args = process.argv.slice(2);
if (args.length < 2) {
    console.log("usage: widl-codegen <input> <language...>");
    process.exit(1);
}
const input = args[0];
const languages = args.slice(1);
fs_1.default.readFile(input, "utf8", async function (err, data) {
    if (err) {
        throw err;
    }
    const doc = widl_1.parse(data);
    const context = new widl_1.Context({
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
                    const writer = new widl_1.Writer();
                    const visitor = new assemblyscript_1.ModuleVisitor(writer);
                    doc.accept(context, visitor);
                    let source = writer.string();
                    source = formatAssemblyScript(source);
                    fs_1.default.writeFileSync("module.ts", source);
                }
                {
                    const writer = new widl_1.Writer();
                    const visitor = new assemblyscript_1.ScaffoldVisitor(writer);
                    doc.accept(context, visitor);
                    let source = writer.string();
                    source = formatAssemblyScript(source);
                    fs_1.default.writeFileSync("index.ts", source);
                }
                break;
            case "tinygo":
                {
                    const writer = new widl_1.Writer();
                    const visitor = new tinygo_1.ModuleVisitor(writer);
                    doc.accept(context, visitor);
                    let source = writer.string();
                    fs_1.default.writeFileSync("module.go", source);
                    formatGolang("module.go");
                }
                {
                    const writer = new widl_1.Writer();
                    const visitor = new tinygo_1.ScaffoldVisitor(writer);
                    doc.accept(context, visitor);
                    let source = writer.string();
                    fs_1.default.writeFileSync("main.go", source);
                    formatGolang("main.go");
                }
                break;
            case "go":
                {
                    const writer = new widl_1.Writer();
                    const visitor = new go_1.ModuleVisitor(writer);
                    doc.accept(context, visitor);
                    let source = writer.string();
                    fs_1.default.writeFileSync("module2.go", source);
                    formatGolang("module2.go");
                }
                break;
            case "rust":
                {
                    const writer = new widl_1.Writer();
                    const visitor = new rust_1.ModuleVisitor(writer);
                    doc.accept(context, visitor);
                    let source = writer.string();
                    fs_1.default.writeFileSync("generated.rs", source);
                    formatRust("generated.rs");
                }
                {
                    const writer = new widl_1.Writer();
                    const visitor = new rust_1.ScaffoldVisitor(writer);
                    doc.accept(context, visitor);
                    let source = writer.string();
                    fs_1.default.writeFileSync("lib.rs", source);
                    formatRust("lib.rs");
                }
                break;
        }
    });
});
function formatAssemblyScript(source) {
    try {
        source = prettier_1.default.format(source, {
            semi: true,
            parser: "typescript",
        });
    }
    catch (err) { }
    return source;
}
function formatGolang(filename) {
    child_process_1.default.execSync("go fmt " + filename);
}
function formatRust(filename) {
    child_process_1.default.execSync("rustfmt " + filename);
}
