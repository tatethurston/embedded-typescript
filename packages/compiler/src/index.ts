import {
  trimLeadingIndentation,
  getLeadingIndentation,
  trimLaggingNewline,
  sanitizeString,
  trimLeadingIndentationAndNewline,
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

  nodes.forEach((node, idx) => {
    const prevNode = nodes[idx - 1];
    const nextNode = nodes[idx + 1];

    switch (node.type) {
      case "untemplated": {
        write(node.content);
        break;
      }
      case "text": {
        let content = node.content;

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (prevNode?.type === "statement") {
          content = trimLaggingNewline(content);
        } else if (
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          prevNode?.type === "templateMarker" &&
          prevNode.context.marker === "start"
        ) {
          content = trimLaggingNewline(content);
        }

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (nextNode?.type === "statement") {
          content = trimLeadingIndentation(content);
        } else if (
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          nextNode?.type === "templateMarker" &&
          nextNode.context.marker === "end"
        ) {
          content = trimLeadingIndentationAndNewline(content);
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
      case "templateMarker": {
        if (node.context.marker === "start") {
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          indent = getLeadingIndentation(prevNode?.content ?? "");
          write(`(() => {\n`);
          indent += "  ";
          write(`let ${RESULT} = '';\n`);
        } else {
          write(`return ${RESULT};\n`);
          write(`})()`);
          indent = "";
        }
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
