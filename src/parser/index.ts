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

export function parse(template: string): Node[] {
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
      console.error("'", text, "'");
      throw new Error(
        `Expected text to be inside a block at position ${position}`
      );
    }

    if ((!isPresent(openIdx) && isPresent(closeIdx)) || closeIdx < openIdx) {
      throw new Error(`Unexpected '${CLOSE}' at position ${closeIdx}`);
    }

    if (isPresent(openIdx) && !isPresent(closeIdx)) {
      throw new Error(`Expected to find '${CLOSE}' before ${template.length}`);
    }

    const nextOpenIdx = template.indexOf(OPEN, openIdx + OPEN.length);
    if (isPresent(nextOpenIdx) && nextOpenIdx < closeIdx) {
      throw new Error(`Unexpected '${OPEN}' at position ${nextOpenIdx}`);
    }

    // text before template code
    const text = template.slice(position, openIdx);
    if (block.isOpen()) {
      parsed.push({ type: "text", content: text });
    } else if (!isWhitespace(text)) {
      console.error("'", text, "'");
      throw new Error(
        `Expected text to be inside a block at position ${position}`
      );
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

  if (block.isOpen()) {
    throw new Error(
      `Expected closing tags for '${block.blocks.join(
        ", "
      )}' at position ${position}`
    );
  }
  return parsed;
}
