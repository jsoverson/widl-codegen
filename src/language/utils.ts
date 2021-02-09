import { Context, StringValue } from "../widl";

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

export function formatComment(
  prefix: string,
  text: string | StringValue | undefined,
  wrapLength: number
): string {
  if (text == undefined) {
    return "";
  }
  let textValue = "";
  if (text instanceof StringValue) {
    textValue = text.value;
  } else {
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
    } else {
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
