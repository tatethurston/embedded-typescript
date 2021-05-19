/**
 * Escape for safe inclusion in a single (') quoted string.
 */
export function sanitizeString(token: string): string {
  return token
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/\n/g, "\\n");
}

const INDENTATION_TO_END_LINE_0 = /^[^\S\n]+$/;
const INDENTATION_TO_END_LINE_N = /\n([^\S\n]*)$/;
const START_TO_LINE_BREAK = /^[^\S\n]*\n/;

/**
 * Returns the preceding indentation.
 * ___<% %>
 */
export function getLeadingIndentation(token: string): string {
  // if it's the first line
  return (
    // eslint-disable-next-line @typescript-eslint/prefer-regexp-exec
    token.match(INDENTATION_TO_END_LINE_0)?.[0] ??
    // eslint-disable-next-line @typescript-eslint/prefer-regexp-exec
    token.match(INDENTATION_TO_END_LINE_N)?.[1] ??
    ""
  );
}

/**
 * Trims the preceding indentation.
 * ___<% %>
 */
export function trimLeadingIndentation(token: string): string {
  // if it's the first line
  // eslint-disable-next-line @typescript-eslint/prefer-regexp-exec
  if (token.match(INDENTATION_TO_END_LINE_0)) {
    return token.replace(INDENTATION_TO_END_LINE_0, "");
  }
  return token.replace(INDENTATION_TO_END_LINE_N, "\n");
}

/**
 * Trims the following line break and any whitespace.
 *
 * <% %>___
 */
export function trimLaggingNewline(token: string): string {
  return token.replace(START_TO_LINE_BREAK, "");
}

/**
 * Trims the preceding line break and any whitespace.
 *   _
 * __<%>
 */
export function trimLeadingIndentationAndNewline(token: string): string {
  // if it's the first line
  // eslint-disable-next-line @typescript-eslint/prefer-regexp-exec
  if (token.match(INDENTATION_TO_END_LINE_0)) {
    return token.replace(INDENTATION_TO_END_LINE_0, "");
  }
  return token.replace(INDENTATION_TO_END_LINE_N, "");
}
