import { trimLagging, trimLeading, sanitizeString } from "./utils";
import {
  Node,
  BlockNode,
  StatementNode,
  parse,
  ParseError,
  isParseError,
} from "@ets/parser";

function isStatementNode(node: Node): node is StatementNode | BlockNode {
  return ["statement", "blockOpen", "blockClose"].includes(node.type);
}

const RESULT = "result";

function compile(nodes: Node[]): string {
  let compiled = "";

  nodes.forEach((node, idx) => {
    switch (node.type) {
      case "text": {
        let content = node.content;

        const prevNode = nodes[idx - 1];
        if (
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          prevNode &&
          (isStatementNode(prevNode) ||
            (prevNode.type === "expression" && prevNode.context.trimLagging))
        ) {
          content = trimLagging(content);
        }

        const nextNode = nodes[idx + 1];
        if (
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          nextNode &&
          isStatementNode(nextNode)
        ) {
          content = trimLeading(content);
        }

        if (content) {
          compiled += `${RESULT} += '${sanitizeString(content)}';\n`;
        }
        break;
      }
      case "expression": {
        compiled += `${RESULT} += ${node.content};\n`;
        break;
      }
      case "statement": {
        compiled += `${node.content}\n`;
        break;
      }
      case "blockOpen": {
        compiled += `${node.content}\n`;
        if (node.context.isRoot) {
          compiled += `let ${RESULT} = '';\n`;
        }
        break;
      }
      case "blockClose": {
        if (node.context.isRoot) {
          compiled += `return ${RESULT};\n`;
        }
        compiled += `${node.content}\n`;
        break;
      }
      default: {
        const exhaust: never = node;
        return exhaust;
      }
    }
  });
  return compiled;
}

export function compiler(template: string): string | ParseError {
  const parsed = parse(template);
  if (isParseError(parsed)) {
    return parsed;
  }
  return compile(parsed);
}
