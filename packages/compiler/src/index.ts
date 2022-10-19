import { format } from "prettier";
import {
  trimLeadingIndentation,
  getLeadingIndentation,
  trimLaggingNewline,
  sanitizeString,
  removeFinalNewline,
} from "./utils";
import { Node, parse, ParseError, isParseError } from "@ets/parser";

const RESULT = "result";

function compile(nodes: Node[]): string {
  let compiled = "";
  let indent = "";

  function write(text: string): void {
    compiled += indent + text;
  }

  function preserveIndentation(text: string, indentation: string): string {
    return text
      .toString()
      .split("\n")
      .map((line, idx) => (idx === 0 ? line : indentation + line))
      .join("\n");
  }

  //console.log(JSON.stringify(nodes));
  nodes.forEach((node, idx) => {
    const prevNode = nodes[idx - 1];
    const nextNode = nodes[idx + 1];

    switch (node.type) {
      case "header": {
        const props = /(interface|type) Props/.test(node.content)
          ? "Props"
          : "unknown";
        write(`${node.content}\n\n`);
        write(`export default function (props: ${props}): string {\n`);
        indent += "  ";
        write(`let ${RESULT} = '';\n`);
        break;
      }
      case "text": {
        let content = node.content;

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (prevNode?.type === "statement" || prevNode?.type === "header") {
          content = trimLaggingNewline(content);
        }

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (nextNode?.type === "statement") {
          content = trimLeadingIndentation(content);
        }

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!nextNode) {
          content = removeFinalNewline(content);
        }

        if (content) {
          write(`${RESULT} += '${sanitizeString(content)}';\n`);
        }
        break;
      }
      case "expression": {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        const indentation = getLeadingIndentation(prevNode.content ?? "");
        if (!indentation) {
          write(`${RESULT} += ${node.content};\n`);
        } else {
          write(
            `${RESULT} += (${preserveIndentation.toString()})(${
              node.content
            }, '${indentation}');\n`
          );
        }
        break;
      }
      case "statement": {
        write(`${node.content}\n`);
        break;
      }
      default: {
        const exhaust: never = node;
        return exhaust;
      }
    }
  });

  write(`return ${RESULT};\n`);
  indent = "";
  write(`}`);

  return compiled;
}

export function compiler(template: string): string | ParseError {
  const parsed = parse(template);
  if (isParseError(parsed)) {
    return parsed;
  }

  return format(compile(parsed), { parser: "typescript" });
}
