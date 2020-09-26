"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syntaxError = exports.WidlError = void 0;
class WidlError extends Error {
    constructor(message, nodes, source, positions, path) {
        super(message);
        this.nodes = nodes;
        this.source = source;
        this.positions = positions;
        this.path = path;
    }
}
exports.WidlError = WidlError;
function syntaxError(source, position, description) {
    return new WidlError(`Syntax Error: ${description}`, undefined, source, [position], undefined);
}
exports.syntaxError = syntaxError;
