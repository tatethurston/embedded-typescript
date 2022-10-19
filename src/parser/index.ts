function isPresent(idx: number): boolean {
  return idx !== -1;
}

export interface Node {
  type: "header" | "text" | "expression" | "statement";
  content: string;
}

interface Range {
  line: number;
  column: number;
}

export interface ParseError {
  error: string;
  position: {
    start: Range;
    end: Range;
  };
  context: string;
}

const SYMBOLS = {
  Header: "---",
  Open: "<%",
  Close: "%>",
  Expression: "=",
};

function isExpression(token: string): boolean {
  return token.startsWith(SYMBOLS.Expression);
}

function stripModifierToken(token: string): string {
  let stripped = token;
  if (isExpression(token)) {
    stripped = stripped.slice(1);
  }
  return stripped;
}

export function isParseError(
  parsed: unknown | ParseError
): parsed is ParseError {
  return typeof parsed === "object" && parsed != null && "error" in parsed;
}

interface Position {
  line: number;
  column: number;
}

function lineAndColumn(template: string, index: number): Position {
  const lines = template.slice(0, index).split("\n");
  const line = lines.length;
  const column = (lines.pop()?.length ?? 0) + 1;

  return {
    line,
    column,
  };
}

function formatContext(template: string, position: Position): string {
  const templateLines = template.split("\n").length - 1;
  const hasMoreLines = templateLines > position.line;
  const line = template.split("\n")[position.line - 1];
  return `    |
${position.line.toString().padEnd(4, " ")}| ${line}
    | ${"^".padStart(position.column, " ")}
    | ${"|".padStart(position.column, " ")}
${hasMoreLines ? "..." : ""}
`;
}

function parseError({
  error,
  template,
  startIdx,
  endIdx,
}: {
  error: string;
  template: string;
  startIdx: number;
  endIdx: number;
}): ParseError {
  const start = lineAndColumn(template, startIdx);
  const end = lineAndColumn(template, endIdx);

  return {
    error,
    position: {
      start,
      end,
    },
    context: formatContext(template, start),
  };
}

export function parse(template: string): Node[] | ParseError {
  const parsed: Node[] = [];
  let position = 0;

  // header
  const headerStartIdx = template.indexOf(SYMBOLS.Header, 0);
  if (!isPresent(headerStartIdx)) {
    return parseError({
      error: `Expected to find a 'Header' ('${SYMBOLS.Header}') in the template`,
      template,
      startIdx: 0,
      endIdx: template.length - 1,
    });
  }
  const headerEndIdx = template.indexOf(
    SYMBOLS.Header,
    headerStartIdx + SYMBOLS.Header.length
  );
  if (!isPresent(headerEndIdx)) {
    return parseError({
      error: `Expected to find corresponding close to 'Header' ('${SYMBOLS.Header}') before end of template`,
      template,
      startIdx: headerStartIdx,
      endIdx: template.length - 1,
    });
  }
  const contentBeforeHeader = template.slice(0, headerStartIdx);
  const nonWhiteSpaceIdx = contentBeforeHeader.search(/\S/);
  if (isPresent(nonWhiteSpaceIdx)) {
    return parseError({
      error: `Unexpected token before 'Header' ('${SYMBOLS.Header}')`,
      template,
      startIdx: nonWhiteSpaceIdx,
      endIdx: headerStartIdx,
    });
  }
  parsed.push({
    type: "header",
    content: template.slice(
      headerStartIdx + SYMBOLS.Header.length,
      headerEndIdx
    ),
  });
  position = headerEndIdx + SYMBOLS.Header.length;

  // body
  while (position < template.length) {
    const openIdx = template.indexOf(SYMBOLS.Open, position);
    const closeIdx = template.indexOf(SYMBOLS.Close, position);

    if (
      (!isPresent(openIdx) && isPresent(closeIdx)) ||
      (isPresent(openIdx) && isPresent(closeIdx) && closeIdx < openIdx)
    ) {
      return parseError({
        error: `Unexpected closing tag '${SYMBOLS.Close}'`,
        template,
        startIdx: closeIdx,
        endIdx: closeIdx + SYMBOLS.Close.length - 1,
      });
    }

    if (isPresent(openIdx) && !isPresent(closeIdx)) {
      return parseError({
        error: `Expected to find corresponding closing tag '${SYMBOLS.Close}' before end of template`,
        template,
        startIdx: openIdx,
        endIdx: template.length - 1,
      });
    }

    const nextOpenIdx = template.indexOf(
      SYMBOLS.Open,
      openIdx + SYMBOLS.Open.length
    );
    if (isPresent(nextOpenIdx) && nextOpenIdx < closeIdx) {
      return parseError({
        error: `Unexpected opening tag '${SYMBOLS.Open}'`,
        template,
        startIdx: nextOpenIdx,
        endIdx: nextOpenIdx + SYMBOLS.Open.length - 1,
      });
    }

    if (!isPresent(openIdx) && !isPresent(closeIdx)) {
      parsed.push({
        type: "text",
        content: template.slice(position, template.length),
      });
      break;
    }
    // text before open tag
    const text = template.slice(position, openIdx);
    if (text.length) {
      parsed.push({ type: "text", content: text });
    }

    const code = template.slice(openIdx + SYMBOLS.Open.length, closeIdx).trim();
    if (isExpression(code)) {
      parsed.push({
        type: "expression",
        content: stripModifierToken(code),
      });
    } else {
      parsed.push({ type: "statement", content: code });
    }

    position = closeIdx + SYMBOLS.Close.length;
  }

  return parsed;
}
