import { Node, Source } from "./ast/index";
export declare class WidlError extends Error {
    nodes: Array<Node> | Node | undefined;
    source: Source | undefined;
    positions: Array<number> | undefined;
    path: Array<string | number> | undefined;
    constructor(message: string, nodes: Array<Node> | Node | undefined, source: Source | undefined, positions: Array<number> | undefined, path: Array<string | number> | undefined);
}
export declare function syntaxError(source: Source, position: number, description: string): WidlError;
