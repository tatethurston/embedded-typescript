import { blockTracker, isPresent, isWhitespace } from "./utils";

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

type Context = {
  isRoot: boolean;
  trimLagging: boolean;
};

export type TextNode = BaseNode<"text">;

export type ExpressionNode = BaseNode<
  "expression",
  Pick<Context, "trimLagging">
>;

export type StatementNode = BaseNode<"statement">;

export type BlockNode = BaseNode<
  "blockOpen" | "blockClose",
  Pick<Context, "isRoot">
>;

export type Node = TextNode | ExpressionNode | StatementNode | BlockNode;

export type ParseError = {
  error: string;
  position: {
    line: number;
    column: number;
  };
  context: string;
};

const OPEN = "<%";
const CLOSE = "%>";
const EXPRESSION = "=";
const TRIM = "-";

function isExpression(token: string): boolean {
  return token.startsWith(EXPRESSION);
}

function hasLeadingTrim(token: string): boolean {
  return token.startsWith(TRIM);
}

function hasLaggingTrim(token: string): boolean {
  return token.endsWith(TRIM);
}

function stripModifierToken(token: string): string {
  let stripped = token;
  if (isExpression(token) || hasLeadingTrim(token)) {
    stripped = stripped.slice(1);
  }
  if (hasLaggingTrim(token)) {
    stripped = stripped.slice(0, -1);
  }
  return stripped;
}

export function isParseError<T extends unknown>(
  parsed: T | ParseError
): parsed is ParseError {
  return typeof parsed === "object" && "error" in parsed;
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
  index,
}: {
  error: string;
  template: string;
  index: number;
}): ParseError {
  const position = lineAndColumn(template, index);
  return {
    error,
    position,
    context: formatContext(template, position),
  };
}

export function parse(template: string): Node[] | ParseError {
  const parsed: Node[] = [];
  const block = blockTracker();

  let position = 0;
  while (position < template.length) {
    const openIdx = template.indexOf(OPEN, position);
    const closeIdx = template.indexOf(CLOSE, position);

    if (!isPresent(openIdx) && !isPresent(closeIdx)) {
      const text = template.slice(position);
      if (isWhitespace(text)) {
        break;
      }

      // first non whitespace character
      const firstCharacterIndex = position + text.search(/\S/);
      return parseError({
        error: "Expected text to be inside a block",
        template,
        index: firstCharacterIndex,
      });
    }

    if (
      (!isPresent(openIdx) && isPresent(closeIdx)) ||
      (isPresent(openIdx) && isPresent(closeIdx) && closeIdx < openIdx)
    ) {
      return parseError({
        error: `Unexpected closing tag '${CLOSE}'`,
        template,
        index: closeIdx,
      });
    }

    if (isPresent(openIdx) && !isPresent(closeIdx)) {
      return parseError({
        error: `Expected to find corresponding closing tag '${CLOSE}' before end of template`,
        template,
        index: openIdx,
      });
    }

    const nextOpenIdx = template.indexOf(OPEN, openIdx + OPEN.length);
    if (isPresent(nextOpenIdx) && nextOpenIdx < closeIdx) {
      return parseError({
        error: `Unexpected opening tag '${OPEN}'`,
        template,
        index: nextOpenIdx,
      });
    }

    // text before template code
    const text = template.slice(position, openIdx);
    if (block.isOpen()) {
      parsed.push({ type: "text", content: text });
    } else if (!isWhitespace(text)) {
      // first non whitespace character
      const firstCharacterIndex = position + text.search(/\S/);
      return parseError({
        error: "Expected text to be inside a block",
        template,
        index: firstCharacterIndex,
      });
    }

    // template code
    const code = template.slice(openIdx + OPEN.length, closeIdx).trim();
    const content = stripModifierToken(code).trim();
    if (isExpression(code)) {
      parsed.push({
        type: "expression",
        content,
        context: { trimLagging: hasLaggingTrim(code) },
      });
    } else {
      const wasAlreadyOpen = block.isOpen();
      const state = block.digest(content);

      switch (state) {
        case "open": {
          parsed.push({
            type: "blockOpen",
            content,
            context: {
              isRoot: !wasAlreadyOpen,
            },
          });
          break;
        }
        case "close": {
          const isRoot = block.blocks.length === 0;
          parsed.push({
            type: "blockClose",
            content,
            context: {
              isRoot,
            },
          });
          break;
        }
        case "balanced": {
          parsed.push({ type: "statement", content });
          break;
        }
        default: {
          const exhaust: never = state;
          return exhaust;
        }
      }
    }
    position = closeIdx + CLOSE.length;
  }

  // TODO: This does not handle escaped tags
  //if (block.isOpen()) {
  //  return {
  //    error: `Expected closing tags for '${block.blocks.join(", ")}'`,
  //    position: lineAndColumn(template, position),
  //    context: "",
  //  };
  //}
  return parsed;
}
