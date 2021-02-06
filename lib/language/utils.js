"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shouldIncludeHandler = exports.shouldIncludeHostCall = void 0;
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
