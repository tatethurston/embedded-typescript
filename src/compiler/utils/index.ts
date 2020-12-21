/**
 * Escape for safe inclusion in a single (') quoted string.
 */
export function sanitizeString(token: string): string {
  return token
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/\n/g, "\\n");
}

const PRECEDING_INDENTATION_FIRST_LINE = /^[^\S\n]+$/;
const PRECEDING_INDENTATION_SUBSEQUENT_LINE = /\n[^\S\n]+$/;
const UP_TO_LINE_BREAK = /^[^\S\n]*\n/;

/**
 * Trims the preceding indentation.
 * ___<% %>
 */
export function trimLeading(token: string): string {
  // eslint-disable-next-line @typescript-eslint/prefer-regexp-exec
  if (token.match(PRECEDING_INDENTATION_FIRST_LINE)) {
    return token.replace(PRECEDING_INDENTATION_FIRST_LINE, "");
  }
  // preserve new line
  return token.replace(PRECEDING_INDENTATION_SUBSEQUENT_LINE, "\n");
}

/**
 * Trims the following line break.
 *
 * <% %>___
 */
export function trimLagging(token: string): string {
  return token.replace(UP_TO_LINE_BREAK, "");
}
