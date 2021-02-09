"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatComment = exports.shouldIncludeHandler = exports.shouldIncludeHostCall = void 0;
const widl_1 = require("../widl");
function shouldIncludeHostCall(context) {
    let roles = context.config.hostRoles;
    return shouldInclude(context, roles);
}
exports.shouldIncludeHostCall = shouldIncludeHostCall;
function shouldIncludeHandler(context) {
    let roles = context.config.handlerRoles;
    return shouldInclude(context, roles);
}
exports.shouldIncludeHandler = shouldIncludeHandler;
function shouldInclude(context, roles) {
    if (context.role != undefined) {
        if (roles == undefined || roles.indexOf(context.role.name.value) == -1) {
            return false;
        }
    }
    else if (context.config.skipInterface == true) {
        return false;
    }
    return true;
}
function formatComment(prefix, text, wrapLength) {
    if (text == undefined) {
        return "";
    }
    let textValue = "";
    if (text instanceof widl_1.StringValue) {
        textValue = text.value;
    }
    else {
        textValue = text;
    }
    let comment = "";
    let line = "";
    let word = "";
    for (var i = 0; i < textValue.length; i++) {
        let c = textValue[i];
        if (c == " " || c == "\n") {
            if (c == "\n" || line.length + word.length > wrapLength) {
                if (comment.length > 0) {
                    comment += "\n";
                }
                comment += prefix + line;
                line = word.trim();
            }
        }
        else {
            word += c;
        }
    }
    if (line.length > 0) {
        if (comment.length > 0) {
            comment += "\n";
        }
        comment += prefix + line;
    }
    if (comment.length > 0) {
        comment += "\n";
    }
    return comment;
}
exports.formatComment = formatComment;
