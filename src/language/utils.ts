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

  // Replace single newline characters with space so that the logic below
  // handles line wrapping. Multiple newlines are preserved. It was simpler
  // to do this than regex.
  for (i = 1; i < textValue.length - 1; i++) {
    if (
      textValue[i] == "\n" &&
      textValue[i - 1] != "\n" &&
      textValue[i + 1] != "\n"
    ) {
      textValue = textValue.substring(0, i) + " " + textValue.substring(i + 1);
    }
  }

  let comment = "";
  let line = "";
  let word = "";
  for (var i = 0; i < textValue.length; i++) {
    let c = textValue[i];
    if (c == " " || c == "\n") {
      if (line.length + word.length > wrapLength) {
        if (comment.length > 0) {
          comment += "\n";
        }
        comment += prefix + line.trim();
        line = word.trim();
        word = " ";
      } else if (c == "\n") {
        line += word;
        if (comment.length > 0) {
          comment += "\n";
        }
        comment += prefix + line.trim();
        line = "";
        word = "";
      } else {
        line += word;
        word = c;
      }
    } else {
      word += c;
    }
  }
  if (line.length + word.length > wrapLength) {
    if (comment.length > 0) {
      comment += "\n";
    }
    comment += prefix + line.trim();
    line = word.trim();
  } else {
    line += word;
  }
  if (line.length > 0) {
    if (comment.length > 0) {
      comment += "\n";
    }
    comment += prefix + line.trim();
  }
  if (comment.length > 0) {
    comment += "\n";
  }
  return comment;
}
