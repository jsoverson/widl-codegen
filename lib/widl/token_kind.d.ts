/**
 * The enum type representing the token kinds values.
 */
export declare enum TokenKind {
    EOF = 1,
    BANG = 2,
    QUESTION = 3,
    DOLLAR = 4,
    PAREN_L = 5,
    PAREN_R = 6,
    SPREAD = 7,
    COLON = 8,
    EQUALS = 9,
    AT = 10,
    BRACKET_L = 11,
    BRACKET_R = 12,
    BRACE_L = 13,
    PIPE = 14,
    BRACE_R = 15,
    NAME = 16,
    NS = 17,
    INT = 18,
    FLOAT = 19,
    STRING = 20,
    BLOCK_STRING = 21,
    AMP = 22,
    SOF = 23,
    COMMENT = 24
}
export declare const TokenDescription: Map<number, string>;
