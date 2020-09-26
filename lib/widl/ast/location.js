"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Location = void 0;
class Location {
    constructor(start, end, source) {
        this.start = start || 0;
        this.end = end || 0;
        this.source = source || null;
    }
}
exports.Location = Location;
