import { Document, Value } from "./ast/index";
/**
 * Configuration options to control parser behavior
 */
export declare type ParseOptions = {
    /**
     * By default, the parser creates AST nodes that know the location
     * in the source that they correspond to. This configuration flag
     * disables that behavior for performance or testing.
     */
    noLocation: boolean;
    noSource: boolean;
};
/**
 * Given a WIDL source, parses it into a Document.
 * Throws WidlError if a syntax error is encountered.
 */
export declare function parse(source: string, options?: ParseOptions): Document;
/**
 * Given a string containing a WIDL value (ex. `[42]`), parse the AST for
 * that value.
 * Throws WidlError if a syntax error is encountered.
 *
 * This is useful within tools that operate upon WIDL Values directly and
 * in isolation of complete WIDL documents.
 *
 * Consider providing the results to the utility function: valueFromAST().
 */
export declare function parseValue(source: string, options?: ParseOptions): Value;
