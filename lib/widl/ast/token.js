"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Token = void 0;
class Token {
    constructor(kind, start, end, prev, value) {
        this.kind = kind;
        this.start = start;
        this.end = end;
        this.value = value || "";
        this.prev = prev;
        this.next = null;
    }
}
exports.Token = Token;
