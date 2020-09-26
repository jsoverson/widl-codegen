"use strict";
// @flow strict
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTokenKindDesc = exports.getTokenDesc = exports.isPunctuatorTokenKind = exports.Lexer = void 0;
//import { syntaxError } from '../error/syntaxError';
const index_1 = require("./ast/index");
const blockstring_1 = require("./blockstring");
const token_kind_1 = require("./token_kind");
const error_1 = require("./error");
/**
 * Given a Source object, creates a Lexer for that source.
 * A Lexer is a stateful stream generator in that every time
 * it is advanced, it returns the next token in the Source. Assuming the
 * source lexes, the final Token emitted by the lexer will be of kind
 * EOF, after which the lexer will repeatedly return the same EOF token
 * whenever called.
 */
class Lexer {
    constructor(source) {
        const startOfFileToken = new index_1.Token(token_kind_1.TokenKind.SOF, 0, 0, null);
        this.source = source;
        this.lastToken = startOfFileToken;
        this.token = startOfFileToken;
        this.line = 1;
        this.lineStart = 0;
    }
    /**
     * Advances the token stream to the next non-ignored token.
     */
    advance() {
        this.lastToken = this.token;
        const token = (this.token = this.lookahead());
        return token;
    }
    /**
     * Looks ahead and returns the next non-ignored token, but does not change
     * the state of Lexer.
     */
    lookahead() {
        var _a;
        let token = this.token;
        if (token.kind !== token_kind_1.TokenKind.EOF) {
            do {
                // Note: next is only mutable during parsing, so we cast to allow this.
                token = (_a = token.next) !== null && _a !== void 0 ? _a : (token.next = readToken(this, token));
            } while (token.kind === token_kind_1.TokenKind.COMMENT);
        }
        return token;
    }
}
exports.Lexer = Lexer;
/**
 * @internal
 */
function isPunctuatorTokenKind(kind) {
    return (kind === token_kind_1.TokenKind.BANG ||
        kind === token_kind_1.TokenKind.DOLLAR ||
        kind === token_kind_1.TokenKind.AMP ||
        kind === token_kind_1.TokenKind.PAREN_L ||
        kind === token_kind_1.TokenKind.PAREN_R ||
        kind === token_kind_1.TokenKind.SPREAD ||
        kind === token_kind_1.TokenKind.COLON ||
        kind === token_kind_1.TokenKind.EQUALS ||
        kind === token_kind_1.TokenKind.AT ||
        kind === token_kind_1.TokenKind.BRACKET_L ||
        kind === token_kind_1.TokenKind.BRACKET_R ||
        kind === token_kind_1.TokenKind.BRACE_L ||
        kind === token_kind_1.TokenKind.PIPE ||
        kind === token_kind_1.TokenKind.BRACE_R);
}
exports.isPunctuatorTokenKind = isPunctuatorTokenKind;
function printCharCode(code) {
    return (
    // NaN/undefined represents access beyond the end of the file.
    isNaN(code)
        ? token_kind_1.TokenKind.EOF
        : // Trust JSON for ASCII.
            code < 0x007f
                ? JSON.stringify(String.fromCharCode(code))
                : // Otherwise print the escaped form.
                    `"\\u${("00" + code.toString(16).toUpperCase()).slice(-4)}"`);
}
/**
 * Gets the next token from the source starting at the given position.
 *
 * This skips over whitespace until it finds the next lexable token, then lexes
 * punctuators immediately or calls the appropriate helper function for more
 * complicated tokens.
 */
function readToken(lexer, prev) {
    const source = lexer.source;
    const body = source.body;
    const bodyLength = body.length;
    const pos = positionAfterWhitespace(body, prev.end, lexer);
    const line = lexer.line;
    const col = 1 + pos - lexer.lineStart;
    if (pos >= bodyLength) {
        return new index_1.Token(token_kind_1.TokenKind.EOF, bodyLength, bodyLength, prev);
    }
    const code = body.charCodeAt(pos);
    // SourceCharacter
    switch (code) {
        // !
        case 33:
            return new index_1.Token(token_kind_1.TokenKind.BANG, pos, pos + 1, prev);
        // #
        case 35:
            return readComment(source, pos, line, col, prev);
        // $
        case 36:
            return new index_1.Token(token_kind_1.TokenKind.DOLLAR, pos, pos + 1, prev);
        // &
        case 38:
            return new index_1.Token(token_kind_1.TokenKind.AMP, pos, pos + 1, prev);
        // (
        case 40:
            return new index_1.Token(token_kind_1.TokenKind.PAREN_L, pos, pos + 1, prev);
        // )
        case 41:
            return new index_1.Token(token_kind_1.TokenKind.PAREN_R, pos, pos + 1, prev);
        // .
        case 46:
            if (body.charCodeAt(pos + 1) === 46 && body.charCodeAt(pos + 2) === 46) {
                return new index_1.Token(token_kind_1.TokenKind.SPREAD, pos, pos + 3, prev);
            }
            break;
        // :
        case 58:
            return new index_1.Token(token_kind_1.TokenKind.COLON, pos, pos + 1, prev);
        // =
        case 61:
            return new index_1.Token(token_kind_1.TokenKind.EQUALS, pos, pos + 1, prev);
        // ?
        case 63:
            return new index_1.Token(token_kind_1.TokenKind.QUESTION, pos, pos + 1, prev);
        // @
        case 64:
            return new index_1.Token(token_kind_1.TokenKind.AT, pos, pos + 1, prev);
        // [
        case 91:
            return new index_1.Token(token_kind_1.TokenKind.BRACKET_L, pos, pos + 1, prev);
        // ]
        case 93:
            return new index_1.Token(token_kind_1.TokenKind.BRACKET_R, pos, pos + 1, prev);
        // {
        case 123:
            return new index_1.Token(token_kind_1.TokenKind.BRACE_L, pos, pos + 1, prev);
        // |
        case 124:
            return new index_1.Token(token_kind_1.TokenKind.PIPE, pos, pos + 1, prev);
        // }
        case 125:
            return new index_1.Token(token_kind_1.TokenKind.BRACE_R, pos, pos + 1, prev);
        // A-Z _ a-z
        case 65:
        case 66:
        case 67:
        case 68:
        case 69:
        case 70:
        case 71:
        case 72:
        case 73:
        case 74:
        case 75:
        case 76:
        case 77:
        case 78:
        case 79:
        case 80:
        case 81:
        case 82:
        case 83:
        case 84:
        case 85:
        case 86:
        case 87:
        case 88:
        case 89:
        case 90:
        case 95:
        case 97:
        case 98:
        case 99:
        case 100:
        case 101:
        case 102:
        case 103:
        case 104:
        case 105:
        case 106:
        case 107:
        case 108:
        case 109:
        case 110:
        case 111:
        case 112:
        case 113:
        case 114:
        case 115:
        case 116:
        case 117:
        case 118:
        case 119:
        case 120:
        case 121:
        case 122:
            return readName(source, pos, line, col, prev);
        // - 0-9
        case 45:
        case 48:
        case 49:
        case 50:
        case 51:
        case 52:
        case 53:
        case 54:
        case 55:
        case 56:
        case 57:
            return readNumber(source, pos, code, line, col, prev);
        // "
        case 34:
            if (body.charCodeAt(pos + 1) === 34 && body.charCodeAt(pos + 2) === 34) {
                return readBlockString(source, pos, line, col, prev, lexer);
            }
            return readString(source, pos, line, col, prev);
    }
    throw error_1.syntaxError(source, pos, "unexpected char");
}
/**
 * Report a message that an unexpected character was encountered.
 */
function unexpectedCharacterMessage(code) {
    if (code < 0x0020 && code !== 0x0009 && code !== 0x000a && code !== 0x000d) {
        return `Cannot contain the invalid character ${printCharCode(code)}.`;
    }
    if (code === 39) {
        // '
        return "Unexpected single quote character ('), did you mean to use a double quote (\")?";
    }
    return `Cannot parse the unexpected character ${printCharCode(code)}.`;
}
/**
 * Reads from body starting at startPosition until it finds a non-whitespace
 * character, then returns the position of that character for lexing.
 */
function positionAfterWhitespace(body, startPosition, lexer) {
    const bodyLength = body.length;
    let position = startPosition;
    while (position < bodyLength) {
        const code = body.charCodeAt(position);
        // tab | space | comma | BOM
        if (code === 9 || code === 32 || code === 44 || code === 0xfeff) {
            ++position;
        }
        else if (code === 10) {
            // new line
            ++position;
            ++lexer.line;
            lexer.lineStart = position;
        }
        else if (code === 13) {
            // carriage return
            if (body.charCodeAt(position + 1) === 10) {
                position += 2;
            }
            else {
                ++position;
            }
            ++lexer.line;
            lexer.lineStart = position;
        }
        else {
            break;
        }
    }
    return position;
}
/**
 * Reads a comment token from the source file.
 *
 * #[\u0009\u0020-\uFFFF]*
 */
function readComment(source, start, line, col, prev) {
    const body = source.body;
    let code;
    let position = start;
    do {
        code = body.charCodeAt(++position);
    } while (!isNaN(code) &&
        // SourceCharacter but not LineTerminator
        (code > 0x001f || code === 0x0009));
    return new index_1.Token(token_kind_1.TokenKind.COMMENT, start, position, prev, body.slice(start + 1, position));
}
/**
 * Reads a number token from the source file, either a float
 * or an int depending on whether a decimal point appears.
 *
 * Int:   -?(0|[1-9][0-9]*)
 * Float: -?(0|[1-9][0-9]*)(\.[0-9]+)?((E|e)(+|-)?[0-9]+)?
 */
function readNumber(source, start, firstCode, line, col, prev) {
    const body = source.body;
    let code = firstCode;
    let position = start;
    let isFloat = false;
    if (code === 45) {
        // -
        code = body.charCodeAt(++position);
    }
    if (code === 48) {
        // 0
        code = body.charCodeAt(++position);
        if (code >= 48 && code <= 57) {
            /*
            throw syntaxError(
              source,
              position,
              `Invalid number, unexpected digit after 0: ${printCharCode(code)}.`,
            );*/
        }
    }
    else {
        position = readDigits(source, position, code);
        code = body.charCodeAt(position);
    }
    if (code === 46) {
        // .
        isFloat = true;
        code = body.charCodeAt(++position);
        position = readDigits(source, position, code);
        code = body.charCodeAt(position);
    }
    if (code === 69 || code === 101) {
        // E e
        isFloat = true;
        code = body.charCodeAt(++position);
        if (code === 43 || code === 45) {
            // + -
            code = body.charCodeAt(++position);
        }
        position = readDigits(source, position, code);
        code = body.charCodeAt(position);
    }
    // Numbers cannot be followed by . or NameStart
    if (code === 46 || isNameStart(code)) {
        /*
        throw syntaxError(
          source,
          position,
          `Invalid number, expected digit but got: ${printCharCode(code)}.`,
        );*/
    }
    return new index_1.Token(isFloat ? token_kind_1.TokenKind.FLOAT : token_kind_1.TokenKind.INT, start, position, prev, body.slice(start, position));
}
/**
 * Returns the new position in the source after reading digits.
 */
function readDigits(source, start, firstCode) {
    const body = source.body;
    let position = start;
    let code = firstCode;
    if (code >= 48 && code <= 57) {
        // 0 - 9
        do {
            code = body.charCodeAt(++position);
        } while (code >= 48 && code <= 57); // 0 - 9
        return position;
    }
    return -1; // Remove this
    // TODO
    /*
    throw syntaxError(
      source,
      position,
      `Invalid number, expected digit but got: ${printCharCode(code)}.`,
    );*/
}
/**
 * Reads a string token from the source file.
 *
 * "([^"\\\u000A\u000D]|(\\(u[0-9a-fA-F]{4}|["\\/bfnrt])))*"
 */
function readString(source, start, line, col, prev) {
    const body = source.body;
    let position = start + 1;
    let chunkStart = position;
    let code = 0;
    let value = "";
    while (position < body.length &&
        !isNaN((code = body.charCodeAt(position))) &&
        // not LineTerminator
        code !== 0x000a &&
        code !== 0x000d) {
        // Closing Quote (")
        if (code === 34) {
            value += body.slice(chunkStart, position);
            return new index_1.Token(token_kind_1.TokenKind.STRING, start, position + 1, prev, value);
        }
        // SourceCharacter
        if (code < 0x0020 && code !== 0x0009) {
            // TODO
            /*
            throw syntaxError(
              source,
              position,
              `Invalid character within String: ${printCharCode(code)}.`,
            );
            */
        }
        ++position;
        if (code === 92) {
            // \
            value += body.slice(chunkStart, position - 1);
            code = body.charCodeAt(position);
            switch (code) {
                case 34:
                    value += '"';
                    break;
                case 47:
                    value += "/";
                    break;
                case 92:
                    value += "\\";
                    break;
                case 98:
                    value += "\b";
                    break;
                case 102:
                    value += "\f";
                    break;
                case 110:
                    value += "\n";
                    break;
                case 114:
                    value += "\r";
                    break;
                case 116:
                    value += "\t";
                    break;
                case 117: {
                    // uXXXX
                    const charCode = uniCharCode(body.charCodeAt(position + 1), body.charCodeAt(position + 2), body.charCodeAt(position + 3), body.charCodeAt(position + 4));
                    if (charCode < 0) {
                        const invalidSequence = body.slice(position + 1, position + 5);
                        throw error_1.syntaxError(source, position, "invalid sequence");
                        /*throw syntaxError(
                          source,
                          position,
                          `Invalid character escape sequence: \\u${invalidSequence}.`,
                        );*/
                    }
                    value += String.fromCharCode(charCode);
                    position += 4;
                    break;
                }
                default:
                    throw error_1.syntaxError(source, position, "Invalid character escape sequence");
                /*throw syntaxError(
                    source,
                    position,
                    `Invalid character escape sequence: \\${String.fromCharCode(
                      code,
                    )}.`,
                  );*/
            }
            ++position;
            chunkStart = position;
        }
    }
    throw error_1.syntaxError(source, position, "Unterminated string.");
    //throw syntaxError(source, position, 'Unterminated string.');
}
/**
 * Reads a block string token from the source file.
 *
 * """("?"?(\\"""|\\(?!=""")|[^"\\]))*"""
 */
function readBlockString(source, start, line, col, prev, lexer) {
    const body = source.body;
    let position = start + 3;
    let chunkStart = position;
    let code = 0;
    let rawValue = "";
    while (position < body.length && !isNaN((code = body.charCodeAt(position)))) {
        // Closing Triple-Quote (""")
        if (code === 34 &&
            body.charCodeAt(position + 1) === 34 &&
            body.charCodeAt(position + 2) === 34) {
            rawValue += body.slice(chunkStart, position);
            return new index_1.Token(token_kind_1.TokenKind.BLOCK_STRING, start, position + 3, prev, blockstring_1.dedentBlockStringValue(rawValue));
        }
        // SourceCharacter
        if (code < 0x0020 &&
            code !== 0x0009 &&
            code !== 0x000a &&
            code !== 0x000d) {
            throw error_1.syntaxError(source, position, "Invalid character within String: ${printCharCode(code)}");
            /*
            throw syntaxError(
              source,
              position,
              `Invalid character within String: ${printCharCode(code)}.`,
            );
            */
        }
        if (code === 10) {
            // new line
            ++position;
            ++lexer.line;
            lexer.lineStart = position;
        }
        else if (code === 13) {
            // carriage return
            if (body.charCodeAt(position + 1) === 10) {
                position += 2;
            }
            else {
                ++position;
            }
            ++lexer.line;
            lexer.lineStart = position;
        }
        else if (
        // Escape Triple-Quote (\""")
        code === 92 &&
            body.charCodeAt(position + 1) === 34 &&
            body.charCodeAt(position + 2) === 34 &&
            body.charCodeAt(position + 3) === 34) {
            rawValue += body.slice(chunkStart, position) + '"""';
            position += 4;
            chunkStart = position;
        }
        else {
            ++position;
        }
    }
    throw error_1.syntaxError(source, position, "Unterminated string.");
    //throw syntaxError(source, position, 'Unterminated string.');
}
/**
 * Converts four hexadecimal chars to the integer that the
 * string represents. For example, uniCharCode('0','0','0','f')
 * will return 15, and uniCharCode('0','0','f','f') returns 255.
 *
 * Returns a negative number on error, if a char was invalid.
 *
 * This is implemented by noting that char2hex() returns -1 on error,
 * which means the result of ORing the char2hex() will also be negative.
 */
function uniCharCode(a, b, c, d) {
    return ((char2hex(a) << 12) | (char2hex(b) << 8) | (char2hex(c) << 4) | char2hex(d));
}
/**
 * Converts a hex character to its integer value.
 * '0' becomes 0, '9' becomes 9
 * 'A' becomes 10, 'F' becomes 15
 * 'a' becomes 10, 'f' becomes 15
 *
 * Returns -1 on error.
 */
function char2hex(a) {
    return a >= 48 && a <= 57
        ? a - 48 // 0-9
        : a >= 65 && a <= 70
            ? a - 55 // A-F
            : a >= 97 && a <= 102
                ? a - 87 // a-f
                : -1;
}
/**
 * Reads an alphanumeric + underscore name from the source.
 *
 * [_A-Za-z][_0-9A-Za-z]*
 */
function readName(source, start, line, col, prev) {
    const body = source.body;
    const bodyLength = body.length;
    let position = start + 1;
    let code = 0;
    while (position !== bodyLength &&
        !isNaN((code = body.charCodeAt(position))) &&
        (code === 95 || // _
            (code >= 48 && code <= 57) || // 0-9
            (code >= 65 && code <= 90) || // A-Z
            (code >= 97 && code <= 122)) // a-z
    ) {
        ++position;
    }
    return new index_1.Token(token_kind_1.TokenKind.NAME, start, position, prev, body.slice(start, position));
}
// _ A-Z a-z
function isNameStart(code) {
    return (code === 95 || (code >= 65 && code <= 90) || (code >= 97 && code <= 122));
}
/**
 * A helper function to describe a token as a string for debugging
 */
function getTokenDesc(token) {
    const desc = getTokenKindDesc(token.kind);
    if (token.value == "") {
        return desc;
    }
    return `kind: ${desc} \"${token.value}\", start: ${token.start}, end: ${token.end}`;
}
exports.getTokenDesc = getTokenDesc;
/**
 * A helper function to describe a token kind as a string for debugging
 */
function getTokenKindDesc(kind) {
    return token_kind_1.TokenDescription.get(kind) || "";
}
exports.getTokenKindDesc = getTokenKindDesc;
