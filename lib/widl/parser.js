"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseValue = exports.parse = void 0;
const token_kind_1 = require("./token_kind");
const lexer_1 = require("./lexer");
const error_1 = require("./error");
const auto_bind_1 = __importDefault(require("auto-bind"));
const index_1 = require("./ast/index");
/**
 * Given a GraphQL source, parses it into a Document.
 * Throws GraphQLError if a syntax error is encountered.
 */
function parse(source, options) {
    const parser = new Parser(source, options);
    return parser.parseDocument();
}
exports.parse = parse;
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
function parseValue(source, options) {
    const parser = new Parser(source, options);
    parser.expectToken(token_kind_1.TokenKind.SOF);
    const value = parser.parseValueLiteral(false);
    parser.expectToken(token_kind_1.TokenKind.EOF);
    return value;
}
exports.parseValue = parseValue;
class Parser {
    constructor(source, options) {
        let src = new index_1.Source("widl");
        src.setBody(source);
        this._lexer = new lexer_1.Lexer(src);
        this._options = options || {
            noLocation: false,
            noSource: false,
        };
        auto_bind_1.default(this);
    }
    /**
     * Converts a name lex token into a name parse node.
     */
    parseName() {
        const token = this.expectToken(token_kind_1.TokenKind.NAME);
        return new index_1.Name(this.loc(token), token.value);
    }
    // Implements the parsing rules in the Document section.
    /**
     * Document : Definition+
     */
    parseDocument() {
        const start = this._lexer.token;
        const def = this.many(token_kind_1.TokenKind.SOF, this.parseDefinition, token_kind_1.TokenKind.EOF);
        return new index_1.Document(this.loc(start), def);
    }
    /**
     * Definition :
     *   - ExecutableDefinition
     *   - TypeSystemDefinition
     *   - TypeSystemExtension
     *
     * ExecutableDefinition :
     *   - OperationDefinition
     *   - FragmentDefinition
     */
    parseDefinition() {
        if (this.peek(token_kind_1.TokenKind.NAME)) {
            switch (this._lexer.token.value) {
                //case "query":
                //case "mutation":
                //case "subscription":
                //  return this.parseOperationDefinition();
                case "interface":
                    return this.parseInterfaceTypeDefinition();
                //case "schema":
                case "scalar":
                case "type":
                case "union":
                case "enum":
                //case "input":
                case "directive":
                    return this.parseTypeSystemDefinition();
                case "namespace":
                    return this.parseNamespaceDefinition();
            }
        }
        else if (this.peek(token_kind_1.TokenKind.BRACE_L)) {
            return this.parseOperationDefinition();
        }
        else if (this.peekDescription()) {
            return this.parseTypeSystemDefinition();
        }
        throw this.unexpected();
    }
    // Implements the parsing rules in the Operations section.
    /**
     * OperationDefinition :
     *  - SelectionSet
     *  - OperationType Name? VariableDefinitions? Directives? SelectionSet
     */
    parseOperationDefinition() {
        const start = this._lexer.token;
        const description = this.parseDescription();
        const name = this.parseName();
        const [definitions, isUnary] = this.parseArgumentDefs(true);
        this.expectToken(token_kind_1.TokenKind.COLON);
        const type = this.parseType();
        const directives = this.parseAnnotations();
        return new index_1.OperationDefinition(this.loc(start), name, description, definitions, type, directives, isUnary);
    }
    /**
     * Type :
     *   - NamedType
     *   - ListType
     *   - NonNullType
     */
    parseType() {
        const start = this._lexer.token;
        var keyType;
        var valueType;
        var ttype;
        // [ String! ]!
        switch (start.kind) {
            case token_kind_1.TokenKind.BRACKET_L:
                this._lexer.advance();
                ttype = this.parseType();
            case token_kind_1.TokenKind.BRACKET_R:
                this._lexer.advance();
                ttype = new index_1.List(this.loc(start), ttype);
                break;
            case token_kind_1.TokenKind.BRACE_L:
                this._lexer.advance();
                keyType = this.parseType();
                this.expectToken(token_kind_1.TokenKind.COLON);
                valueType = this.parseType();
            case token_kind_1.TokenKind.BRACE_R:
                this._lexer.advance();
                ttype = new index_1.Map(this.loc(start), keyType, valueType);
                break;
            case token_kind_1.TokenKind.NAME:
                ttype = this.parseNamed();
                break;
        }
        // QUESTION must be executed
        const skp = this.expectOptionalToken(token_kind_1.TokenKind.QUESTION);
        if (skp) {
            ttype = new index_1.Optional(this.loc(skp), ttype);
        }
        return ttype;
    }
    /**
     * Arguments[Const] : ( Argument[?Const]+ )
     */
    parseArguments() {
        const item = this.parseArgument;
        return this.optionalMany(token_kind_1.TokenKind.PAREN_L, item, token_kind_1.TokenKind.PAREN_R);
    }
    /**
     * Argument[Const] : Name : Value[?Const]
     */
    parseArgument() {
        const start = this._lexer.token;
        const name = this.parseName();
        this.expectToken(token_kind_1.TokenKind.COLON);
        return new index_1.Argument(this.loc(start), name, this.parseValueLiteral(false));
    }
    // Implements the parsing rules in the Values section.
    /**
     * Value[Const] :
     *   - [~Const] Variable
     *   - IntValue
     *   - FloatValue
     *   - StringValue
     *   - BooleanValue
     *   - NullValue
     *   - EnumValue
     *   - ListValue[?Const]
     *   - ObjectValue[?Const]
     *
     * BooleanValue : one of `true` `false`
     *
     * NullValue : `null`
     *
     * EnumValue : Name but not `true`, `false` or `null`
     */
    parseValueLiteral(isConst) {
        const token = this._lexer.token;
        switch (token.kind) {
            case token_kind_1.TokenKind.BRACKET_L:
                return this.parseList(isConst);
            case token_kind_1.TokenKind.BRACE_L:
                return this.parseObject(isConst);
            case token_kind_1.TokenKind.INT:
                this._lexer.advance();
                return new index_1.IntValue(this.loc(token), token.value);
            case token_kind_1.TokenKind.FLOAT:
                this._lexer.advance();
                return new index_1.FloatValue(this.loc(token), token.value);
            case token_kind_1.TokenKind.STRING:
            case token_kind_1.TokenKind.BLOCK_STRING:
                return this.parseStringLiteral();
            case token_kind_1.TokenKind.NAME:
                this._lexer.advance();
                switch (token.value) {
                    case "true":
                        return new index_1.BooleanValue(this.loc(token), true);
                    case "false":
                        return new index_1.BooleanValue(this.loc(token), false);
                    case "null":
                    // TODO
                    default:
                        return new index_1.EnumValue(this.loc(token), token.value);
                }
        }
        throw this.unexpected();
    }
    parseConstValue() {
        return this.parseValueLiteral(true);
    }
    parseValueValue() {
        return this.parseValueLiteral(false);
    }
    parseStringLiteral() {
        const token = this._lexer.token;
        this._lexer.advance();
        return new index_1.StringValue(this.loc(token), token.value); // TODO
    }
    /**
     * ListValue[Const] :
     *   - [ ]
     *   - [ Value[?Const]+ ]
     */
    parseList(isConst) {
        const start = this._lexer.token;
        const item = () => this.parseValueLiteral(isConst);
        return new index_1.ListValue(this.loc(start), this.any(token_kind_1.TokenKind.BRACKET_L, item, token_kind_1.TokenKind.BRACKET_R));
    }
    parseMap(isConst) {
        const start = this._lexer.token;
        const item = () => this.parseValueLiteral(isConst);
        return new index_1.MapValue(this.loc(start), this.any(token_kind_1.TokenKind.BRACE_L, item, token_kind_1.TokenKind.BRACE_R));
    }
    /**
     * ObjectValue[Const] :
     *   - { }
     *   - { ObjectField[?Const]+ }
     */
    parseObject(isConst) {
        const start = this._lexer.token;
        const item = () => this.parseObjectField(isConst);
        return new index_1.ObjectValue(this.loc(start), this.any(token_kind_1.TokenKind.BRACE_L, item, token_kind_1.TokenKind.BRACE_R));
    }
    /**
     * ObjectField[Const] : Name : Value[?Const]
     */
    parseObjectField(isConst) {
        const start = this._lexer.token;
        const name = this.parseName();
        this.expectToken(token_kind_1.TokenKind.COLON);
        return new index_1.ObjectField(this.loc(start), this.parseValueLiteral(isConst), name);
    }
    parseAnnotations() {
        let directives = Array();
        while (this.peek(token_kind_1.TokenKind.AT)) {
            this._lexer.advance(); // TODO cleanup
            directives.push(this.parseAnnotation());
        }
        return directives;
    }
    parseAnnotation() {
        const start = this._lexer.token;
        const name = this.parseName();
        const args = this.parseArguments();
        return new index_1.Annotation(this.loc(start), name, args);
    }
    // Implements the parsing rules in the Types section.
    /**
     * NamedType : Name
     */
    parseNamed() {
        const start = this._lexer.token;
        return new index_1.Named(this.loc(start), this.parseName());
    }
    // Implements the parsing rules in the Type Definition section.
    /**
     * TypeSystemDefinition :
     *   - SchemaDefinition
     *   - TypeDefinition
     *   - DirectiveDefinition
     *
     * TypeDefinition :
     *   - ScalarTypeDefinition
     *   - ObjectTypeDefinition
     *   - InterfaceTypeDefinition
     *   - UnionTypeDefinition
     *   - EnumTypeDefinition
     *   - InputObjectTypeDefinition
     */
    parseTypeSystemDefinition() {
        // Many definitions begin with a description and require a lookahead.
        const keywordToken = this.peekDescription()
            ? this._lexer.lookahead()
            : this._lexer.token;
        if (keywordToken.kind === token_kind_1.TokenKind.NAME) {
            switch (keywordToken.value) {
                case String.fromCharCode(token_kind_1.TokenKind.STRING):
                    return this.parseTypeSystemDefinition();
                case String.fromCharCode(token_kind_1.TokenKind.BLOCK_STRING):
                    return this.parseTypeSystemDefinition();
                case String.fromCharCode(token_kind_1.TokenKind.NAME):
                    return this.parseTypeSystemDefinition();
                case "type":
                    return this.parseObjectTypeDefinition();
                case "interface":
                    return this.parseInterfaceTypeDefinition();
                case "union":
                    return this.parseUnionTypeDefinition();
                case "enum":
                    return this.parseEnumTypeDefinition();
                case "namespace":
                    return this.parseNamespaceDefinition();
                case "directive":
                    return this.parseAnnotationDefinition();
            }
        }
        throw this.unexpected(keywordToken);
    }
    parseNamespaceDefinition() {
        let start = this._lexer.token;
        const description = this.parseDescription();
        this.expectKeyword("namespace");
        start = this._lexer.token;
        if (start.kind == token_kind_1.TokenKind.NS ||
            start.kind == token_kind_1.TokenKind.NAME ||
            start.kind == token_kind_1.TokenKind.STRING) {
            this._lexer.advance();
        }
        else {
            throw this.unexpected();
        }
        const name = new index_1.Name(this.loc(start), start.value);
        const directives = this.parseAnnotations();
        return new index_1.NamespaceDefinition(this.loc(start), description, name, directives);
    }
    peekDescription() {
        return this.peek(token_kind_1.TokenKind.STRING) || this.peek(token_kind_1.TokenKind.BLOCK_STRING);
    }
    /**
     * Description : StringValue
     */
    parseDescription() {
        if (this.peekDescription()) {
            return this.parseStringLiteral();
        }
        return undefined;
    }
    /**
     * ObjectTypeDefinition :
     *   Description?
     *   type Name ImplementsInterfaces? Directives[Const]? FieldsDefinition?
     */
    parseObjectTypeDefinition() {
        const start = this._lexer.token;
        const description = this.parseDescription();
        this.expectKeyword("type");
        const name = this.parseName();
        const interfaces = this.parseImplementsInterfaces();
        const directives = this.parseAnnotations();
        const iFields = this.reverse(token_kind_1.TokenKind.BRACE_L, this.parseFieldDefinition, token_kind_1.TokenKind.BRACE_R, false);
        return new index_1.ObjectDefinition(this.loc(start), name, description, interfaces, directives, iFields);
    }
    /**
     * ImplementsInterfaces :
     *   - implements `&`? NamedType
     *   - ImplementsInterfaces & NamedType
     */
    parseImplementsInterfaces() {
        const types = [];
        if (this.expectOptionalKeyword("implements")) {
            // Optional leading ampersand
            this.expectOptionalToken(token_kind_1.TokenKind.AMP);
            do {
                types.push(this.parseNamed());
            } while (this.expectOptionalToken(token_kind_1.TokenKind.AMP));
        }
        return types;
    }
    /**
     * FieldDefinition :
     *   - Description? Name ArgumentsDefinition? : Type Directives[Const]?
     */
    parseFieldDefinition() {
        const start = this._lexer.token;
        const description = this.parseDescription();
        const name = this.parseName();
        this.expectToken(token_kind_1.TokenKind.COLON);
        const type = this.parseType();
        let defVal;
        if (this.expectOptionalToken(token_kind_1.TokenKind.EQUALS)) {
            defVal = this.parseValueLiteral(true);
        }
        const directives = this.parseAnnotations();
        return new index_1.FieldDefinition(this.loc(start), name, description, type, defVal, directives);
    }
    /**
     * ArgumentsDefinition : ( InputValueDefinition+ )
     */
    parseArgumentDefs(unary) {
        if (this.peek(token_kind_1.TokenKind.PAREN_L)) {
            // arguments operation
            const inputValDefs = this.reverse(token_kind_1.TokenKind.PAREN_L, this.parseInputValueDef, token_kind_1.TokenKind.PAREN_R, true);
            return [inputValDefs, false];
        }
        else if (unary && this.peek(token_kind_1.TokenKind.BRACE_L)) {
            // unary
            this._lexer.advance();
            const inputValueDef = this.parseInputValueDef();
            this.expectToken(token_kind_1.TokenKind.BRACE_R);
            const arr = new Array();
            arr.push(inputValueDef);
            return [arr, true];
        }
        this._lexer.advance();
        throw new Error("for Argument Definitions, expect a ( or [ got " + this._lexer.token);
    }
    /**
     * InputValueDefinition :
     *   - Description? Name : Type DefaultValue? Directives[Const]?
     */
    parseInputValueDef() {
        const start = this._lexer.token;
        const description = this.parseDescription();
        const name = this.parseName();
        this.expectToken(token_kind_1.TokenKind.COLON);
        const type = this.parseType();
        let defaultValue;
        if (this.expectOptionalToken(token_kind_1.TokenKind.EQUALS)) {
            defaultValue = this.parseConstValue();
        }
        const directives = this.parseAnnotations();
        return new index_1.InputValueDefinition(this.loc(start), name, description, type, defaultValue, directives);
    }
    reverse(openKind, parseFn, closeKind, zinteger) {
        this.expectToken(openKind);
        var nodeArr = [];
        while (true) {
            if (this.expectOptionalToken(closeKind)) {
                break;
            }
            else {
                nodeArr.push(parseFn());
            }
        }
        // if (zinteger && NodeList.length == 0) {
        //   null; // TODO
        // }
        return nodeArr;
    }
    /**
     * InterfaceTypeDefinition :
     *   - Description? interface Name Directives[Const]? FieldsDefinition?
     */
    parseInterfaceTypeDefinition() {
        const start = this._lexer.token;
        const description = this.parseDescription();
        this.expectKeyword("interface"); // TODO
        const directives = this.parseAnnotations();
        const iOperations = this.reverse(token_kind_1.TokenKind.BRACE_L, this.parseOperationDefinition, token_kind_1.TokenKind.BRACE_R, false);
        return new index_1.InterfaceDefinition(this.loc(start), description, iOperations, directives);
    }
    /**
     * UnionTypeDefinition :
     *   - Description? union Name Directives[Const]? UnionMemberTypes?
     */
    parseUnionTypeDefinition() {
        const start = this._lexer.token;
        const description = this.parseDescription();
        this.expectKeyword("union");
        const name = this.parseName();
        const directives = this.parseAnnotations();
        this.expectToken(token_kind_1.TokenKind.EQUALS);
        const types = this.parseUnionMembers();
        return new index_1.UnionDefinition(this.loc(start), name, description, directives, types);
    }
    /**
     * UnionMembers :
     *   - NamedType
     *   - UnionMemberTypes | NamedType
     */
    parseUnionMembers() {
        const types = [];
        do {
            const member = this.parseNamed();
            types.push(member);
        } while (this.expectOptionalToken(token_kind_1.TokenKind.PIPE));
        return types;
    }
    /**
     * EnumTypeDefinition :
     *   - Description? enum Name Directives[Const]? EnumValuesDefinition?
     */
    parseEnumTypeDefinition() {
        const start = this._lexer.token;
        const description = this.parseDescription();
        this.expectKeyword("enum");
        const name = this.parseName();
        const directives = this.parseAnnotations();
        const iEnumValueDefs = this.reverse(token_kind_1.TokenKind.BRACE_L, this.parseEnumValueDefinition, token_kind_1.TokenKind.BRACE_R, false);
        return new index_1.EnumDefinition(this.loc(start), name, description, directives, iEnumValueDefs);
    }
    /**
     * EnumValueDefinition : Description? EnumValue Directives[Const]?
     *
     * EnumValue : Name
     */
    parseEnumValueDefinition() {
        const start = this._lexer.token;
        const description = this.parseDescription();
        const name = this.parseName();
        const directives = this.parseAnnotations();
        return new index_1.EnumValueDefinition(this.loc(start), name, description, directives);
    }
    parseAnnotationDefinition() {
        const start = this._lexer.token;
        const description = this.parseDescription();
        this.expectKeyword("directive"); // TODO
        this.expectToken(token_kind_1.TokenKind.AT);
        const name = this.parseName();
        const [args, _] = this.parseArgumentDefs(false);
        this.expectKeyword("on");
        const locs = this.parseAnnotationLocations();
        return new index_1.AnnotationDefinition(this.loc(start), name, description, args, locs);
    }
    /**
     * AnnotationLocations :
     *   - Name
     *   - AnnotationLocations | Name
     */
    parseAnnotationLocations() {
        var locations = [];
        do {
            let name = this.parseName();
            locations.push(name);
        } while (this.expectOptionalToken(token_kind_1.TokenKind.PIPE));
        return locations;
    }
    /**
     * DirectiveLocations :
     *   - `|`? DirectiveLocation
     *   - DirectiveLocations | DirectiveLocation
     */
    parseDirectiveLocations() {
        // Optional leading pipe
        this.expectOptionalToken(token_kind_1.TokenKind.PIPE);
        const locations = [];
        do {
            locations.push(this.parseDirectiveLocation());
        } while (this.expectOptionalToken(token_kind_1.TokenKind.PIPE));
        return locations;
    }
    /*
     * DirectiveLocation :
     *   - ExecutableDirectiveLocation
     *   - TypeSystemDirectiveLocation
     *
     * ExecutableDirectiveLocation : one of
     *   `QUERY`
     *   `MUTATION`
     *   `SUBSCRIPTION`
     *   `FIELD`
     *   `FRAGMENT_DEFINITION`
     *   `FRAGMENT_SPREAD`
     *   `INLINE_FRAGMENT`
     *
     * TypeSystemDirectiveLocation : one of
     *   `SCHEMA`
     *   `SCALAR`
     *   `OBJECT`
     *   `FIELD_DEFINITION`
     *   `ARGUMENT_DEFINITION`
     *   `INTERFACE`
     *   `UNION`
     *   `ENUM`
     *   `ENUM_VALUE`
     *   `INPUT_OBJECT`
     *   `INPUT_FIELD_DEFINITION`
     */
    parseDirectiveLocation() {
        const start = this._lexer.token;
        const name = this.parseName();
        return name;
        throw this.unexpected(start);
    }
    // Core parsing utility functions
    /**
     * Returns a location object, used to identify the place in
     * the source that created a given parsed object.
     */
    loc(startToken) {
        var _a;
        if (startToken == undefined) {
            return undefined;
        }
        if (((_a = this._options) === null || _a === void 0 ? void 0 : _a.noLocation) !== true) {
            return new index_1.Location(startToken.start, startToken.end, this._lexer.source);
        }
        return undefined;
    }
    /**
     * Determines if the next token is of a given kind
     */
    peek(kind) {
        return this._lexer.token.kind === kind;
    }
    /**
     * If the next token is of the given kind, return that token after advancing
     * the lexer. Otherwise, do not change the parser state and throw an error.
     */
    expectToken(kind) {
        const token = this._lexer.token;
        if (token.kind === kind) {
            this._lexer.advance();
            return token;
        }
        throw error_1.syntaxError(this._lexer.source, token.start, `Expected ${lexer_1.getTokenKindDesc(kind)}, found ${lexer_1.getTokenDesc(token)}.`);
    }
    /**
     * If the next token is of the given kind, return that token after advancing
     * the lexer. Otherwise, do not change the parser state and return undefined.
     */
    expectOptionalToken(kind) {
        const token = this._lexer.token;
        if (token.kind === kind) {
            this._lexer.advance();
            return token;
        }
        return undefined;
    }
    /**
     * If the next token is a given keyword, advance the lexer.
     * Otherwise, do not change the parser state and throw an error.
     */
    expectKeyword(value) {
        const token = this._lexer.token;
        if (token.kind === token_kind_1.TokenKind.NAME && token.value === value) {
            this._lexer.advance();
        }
        else {
            throw error_1.syntaxError(this._lexer.source, token.start, `Expected "${value}", found ${lexer_1.getTokenDesc(token)}.`);
        }
    }
    /**
     * If the next token is a given keyword, return "true" after advancing
     * the lexer. Otherwise, do not change the parser state and return "false".
     */
    expectOptionalKeyword(value) {
        const token = this._lexer.token;
        if (token.kind === token_kind_1.TokenKind.NAME && token.value === value) {
            this._lexer.advance();
            return true;
        }
        return false;
    }
    /**
     * Helper function for creating an error when an unexpected lexed token
     * is encountered.
     */
    unexpected(atToken) {
        const token = atToken !== null && atToken !== void 0 ? atToken : this._lexer.token;
        return error_1.syntaxError(this._lexer.source, token.start, `Unexpected ${lexer_1.getTokenDesc(token)}.`);
    }
    /**
     * Returns a possibly empty list of parse nodes, determined by
     * the parseFn. This list begins with a lex token of openKind
     * and ends with a lex token of closeKind. Advances the parser
     * to the next lex token after the closing token.
     */
    any(openKind, parseFn, closeKind) {
        this.expectToken(openKind);
        const nodes = [];
        while (!this.expectOptionalToken(closeKind)) {
            nodes.push(parseFn.call(this));
        }
        return nodes;
    }
    /**
     * Returns a list of parse nodes, determined by the parseFn.
     * It can be empty only if open token is missing otherwise it will always
     * return non-empty list that begins with a lex token of openKind and ends
     * with a lex token of closeKind. Advances the parser to the next lex token
     * after the closing token.
     */
    optionalMany(openKind, parseFn, closeKind) {
        if (this.expectOptionalToken(openKind)) {
            const nodes = [];
            do {
                nodes.push(parseFn.call(this));
            } while (!this.expectOptionalToken(closeKind));
            return nodes;
        }
        return [];
    }
    /**
     * Returns a non-empty list of parse nodes, determined by
     * the parseFn. This list begins with a lex token of openKind
     * and ends with a lex token of closeKind. Advances the parser
     * to the next lex token after the closing token.
     */
    many(openKind, parseFn, closeKind) {
        this.expectToken(openKind);
        const nodes = [];
        do {
            nodes.push(parseFn.call(this));
        } while (!this.expectOptionalToken(closeKind));
        return nodes;
    }
}
