import { Context, StringValue } from "../widl";
export declare function shouldIncludeHostCall(context: Context): boolean;
export declare function shouldIncludeHandler(context: Context): boolean;
export declare function formatComment(prefix: string, text: string | StringValue | undefined, wrapLength: number): string;
