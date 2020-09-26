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
 * Given a GraphQL source, parses it into a Document.
 * Throws GraphQLError if a syntax error is encountered.
 */
export declare function parse(source: string, options?: ParseOptions): Document;
/**
 * Given a string containing a GraphQL value (ex. `[42]`), parse the AST for
 * that value.
 * Throws GraphQLError if a syntax error is encountered.
 *
 * This is useful within tools that operate upon GraphQL Values directly and
 * in isolation of complete GraphQL documents.
 *
 * Consider providing the results to the utility function: valueFromAST().
 */
export declare function parseValue(source: string, options?: ParseOptions): Value;
