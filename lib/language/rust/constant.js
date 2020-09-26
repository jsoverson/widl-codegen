"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.primitives = exports.translations = void 0;
exports.translations = new Map([
    ["ID", "String"],
    ["string", "String"],
    ["bytes", "Vec<u8>"],
]);
exports.primitives = new Set([
    "bool",
    "i8",
    "i16",
    "i32",
    "i64",
    "u8",
    "u16",
    "u32",
    "u64",
    "f32",
    "f64",
    "string",
]);
