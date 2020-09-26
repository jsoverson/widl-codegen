import { Source } from "./source";
export declare class Location {
    start: number;
    end: number;
    source: Source;
    constructor(start: number, end: number, source: Source);
}
