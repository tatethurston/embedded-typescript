import { isPresent } from "./utils";

type BaseNode<T extends string, Ctx = void> = Ctx extends void
  ? {
      type: T;
      content: string;
    }
  : {
      type: T;
      content: string;
      context: Ctx;
    };

export type TemplateMarkerNode = BaseNode<
  "templateMarker",
  {
    marker: "start" | "end";
  }
>;

export type UntemplatedNode = BaseNode<"untemplated">;

export type TextNode = BaseNode<"text">;

export type ExpressionNode = BaseNode<"expression">;

export type StatementNode = BaseNode<"statement">;

export type Node =
  | UntemplatedNode
  | TemplateMarkerNode
  | TextNode
  | ExpressionNode
  | StatementNode;

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

const TEMPLATE_MARKER = "<%>";
const OPEN = "<%";
const CLOSE = "%>";
const EXPRESSION = "=";

function isExpression(token: string): boolean {
  return token.startsWith(EXPRESSION);
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

type Position = { line: number; column: number };

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
  while (position < template.length) {
    const templateStartIdx = template.indexOf(TEMPLATE_MARKER, position);
    const templateRegionStart = templateStartIdx + TEMPLATE_MARKER.length;

    if (!isPresent(templateStartIdx)) {
      parsed.push({
        type: "untemplated",
        content: template.slice(position),
      });
      break;
    }

    const templateEndIdx = template.indexOf(
      TEMPLATE_MARKER,
      templateRegionStart
    );
    const templateRegionEnd = templateEndIdx;
    if (isPresent(templateStartIdx) && !isPresent(templateEndIdx)) {
      return parseError({
        error: `Expected to find corresponding closing tag '${TEMPLATE_MARKER}' before end of file`,
        template,
        startIdx: templateStartIdx,
        endIdx: template.length - 1,
      });
    }

    // text before template start
    const text = template.slice(position, templateStartIdx);
    if (text.length) {
      parsed.push({ type: "untemplated", content: text });
    }

    parsed.push({
      type: "templateMarker",
      content: "",
      context: {
        marker: "start",
      },
    });
    position = templateRegionStart;

    while (position < templateRegionEnd) {
      const region = template.slice(0, templateRegionEnd);
      const openIdx = region.indexOf(OPEN, position);
      const closeIdx = region.indexOf(CLOSE, position);

      if (
        (!isPresent(openIdx) && isPresent(closeIdx)) ||
        (isPresent(openIdx) && isPresent(closeIdx) && closeIdx < openIdx)
      ) {
        return parseError({
          error: `Unexpected closing tag '${CLOSE}'`,
          template,
          startIdx: closeIdx,
          endIdx: closeIdx + CLOSE.length - 1,
        });
      }

      if (isPresent(openIdx) && !isPresent(closeIdx)) {
        return parseError({
          error: `Expected to find corresponding closing tag '${CLOSE}' before end of template`,
          template,
          startIdx: openIdx,
          endIdx: templateRegionEnd,
        });
      }

      const nextOpenIdx = template.indexOf(OPEN, openIdx + OPEN.length);
      if (isPresent(nextOpenIdx) && nextOpenIdx < closeIdx) {
        return parseError({
          error: `Unexpected opening tag '${OPEN}'`,
          template,
          startIdx: nextOpenIdx,
          endIdx: nextOpenIdx + OPEN.length - 1,
        });
      }

      if (!isPresent(openIdx) && !isPresent(closeIdx)) {
        parsed.push({
          type: "text",
          content: region.slice(position, templateRegionEnd),
        });
        break;
      }
      // text before open tag
      const text = template.slice(position, openIdx);
      if (text.length) {
        parsed.push({ type: "text", content: text });
      }

      const code = template.slice(openIdx + OPEN.length, closeIdx).trim();
      if (isExpression(code)) {
        parsed.push({
          type: "expression",
          content: stripModifierToken(code),
        });
      } else {
        parsed.push({ type: "statement", content: code });
      }

      position = closeIdx + CLOSE.length;
    }

    position = templateRegionEnd + TEMPLATE_MARKER.length;

    parsed.push({
      type: "templateMarker",
      content: "",
      context: {
        marker: "end",
      },
    });
  }

  return parsed;
}
