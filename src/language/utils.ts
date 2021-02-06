import { Context } from "../widl";

export function shouldIncludeHostCall(context: Context): boolean {
  let roles = context.config.hostRoles as Array<String>;
  return shouldInclude(context, roles);
}

export function shouldIncludeHandler(context: Context): boolean {
  let roles = context.config.handlerRoles as Array<String>;
  return shouldInclude(context, roles);
}

function shouldInclude(context: Context, roles: Array<String>): boolean {
  if (context.role != undefined) {
    if (roles == undefined || roles.indexOf(context.role.name.value) == -1) {
      return false;
    }
  } else if (context.config.skipInterface == true) {
    return false;
  }
  return true;
}
