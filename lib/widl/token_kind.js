"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenDescription = exports.TokenKind = void 0;
/**
 * The enum type representing the token kinds values.
 */
var TokenKind;
(function (TokenKind) {
    TokenKind[TokenKind["EOF"] = 1] = "EOF";
    TokenKind[TokenKind["BANG"] = 2] = "BANG";
    TokenKind[TokenKind["QUESTION"] = 3] = "QUESTION";
    TokenKind[TokenKind["DOLLAR"] = 4] = "DOLLAR";
    TokenKind[TokenKind["PAREN_L"] = 5] = "PAREN_L";
    TokenKind[TokenKind["PAREN_R"] = 6] = "PAREN_R";
    TokenKind[TokenKind["SPREAD"] = 7] = "SPREAD";
    TokenKind[TokenKind["COLON"] = 8] = "COLON";
    TokenKind[TokenKind["EQUALS"] = 9] = "EQUALS";
    TokenKind[TokenKind["AT"] = 10] = "AT";
    TokenKind[TokenKind["BRACKET_L"] = 11] = "BRACKET_L";
    TokenKind[TokenKind["BRACKET_R"] = 12] = "BRACKET_R";
    TokenKind[TokenKind["BRACE_L"] = 13] = "BRACE_L";
    TokenKind[TokenKind["PIPE"] = 14] = "PIPE";
    TokenKind[TokenKind["BRACE_R"] = 15] = "BRACE_R";
    TokenKind[TokenKind["NAME"] = 16] = "NAME";
    TokenKind[TokenKind["NS"] = 17] = "NS";
    TokenKind[TokenKind["INT"] = 18] = "INT";
    TokenKind[TokenKind["FLOAT"] = 19] = "FLOAT";
    TokenKind[TokenKind["STRING"] = 20] = "STRING";
    TokenKind[TokenKind["BLOCK_STRING"] = 21] = "BLOCK_STRING";
    TokenKind[TokenKind["AMP"] = 22] = "AMP";
    TokenKind[TokenKind["SOF"] = 23] = "SOF";
    TokenKind[TokenKind["COMMENT"] = 24] = "COMMENT";
})(TokenKind = exports.TokenKind || (exports.TokenKind = {}));
exports.TokenDescription = new Map([
    [TokenKind.EOF, "EOF"],
    [TokenKind.BANG, "!"],
    [TokenKind.QUESTION, "?"],
    [TokenKind.DOLLAR, "$"],
    [TokenKind.PAREN_L, "("],
    [TokenKind.PAREN_R, ")"],
    [TokenKind.SPREAD, "..."],
    [TokenKind.COLON, ":"],
    [TokenKind.EQUALS, "="],
    [TokenKind.AT, "@"],
    [TokenKind.BRACKET_L, "["],
    [TokenKind.BRACKET_R, "]"],
    [TokenKind.BRACE_L, "{"],
    [TokenKind.PIPE, "|"],
    [TokenKind.BRACE_R, "}"],
    [TokenKind.NAME, "Name"],
    [TokenKind.NS, "NS"],
    [TokenKind.INT, "Int"],
    [TokenKind.FLOAT, "Float"],
    [TokenKind.STRING, "String"],
    [TokenKind.BLOCK_STRING, "BlockString"],
    [TokenKind.AMP, "&"],
    [TokenKind.SOF, "SOF"],
    [TokenKind.COMMENT, "Comment"],
]);
