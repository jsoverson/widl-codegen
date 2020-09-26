"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Source = void 0;
class Source {
    constructor(name) {
        this.body = ""; // byte array
        this.name = "WIDL";
        this.name = name;
    }
    setBody(str) {
        this.body = str;
    }
}
exports.Source = Source;
