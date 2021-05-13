#!/usr/bin/env node
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, {enumerable: true, configurable: true, writable: true, value}) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __markAsModule = (target) => __defProp(target, "__esModule", {value: true});
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, {get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable});
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? {get: () => module2.default, enumerable: true} : {value: module2, enumerable: true})), module2);
};

// src/cli.ts
var import_fs = __toModule(require("fs"));
var import_path = __toModule(require("path"));

// ../compiler/src/utils/index.ts
function sanitizeString(token) {
  return token.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/\n/g, "\\n");
}
var PRECEDING_INDENTATION_FIRST_LINE = /^[^\S\n]+$/;
var PRECEDING_INDENTATION_SUBSEQUENT_LINE = /\n[^\S\n]+$/;
var UP_TO_LINE_BREAK = /^[^\S\n]*\n/;
function trimLeading(token) {
  if (token.match(PRECEDING_INDENTATION_FIRST_LINE)) {
    return token.replace(PRECEDING_INDENTATION_FIRST_LINE, "");
  }
  return token.replace(PRECEDING_INDENTATION_SUBSEQUENT_LINE, "\n");
}
function trimLagging(token) {
  return token.replace(UP_TO_LINE_BREAK, "");
}

// ../parser/src/utils/index.ts
function isPresent(idx) {
  return idx !== -1;
}
function isWhitespace(token) {
  return token.replace(/\s+/g, "").length === 0;
}
var PAIRS = {
  "}": "{",
  "]": "[",
  ")": "("
};
var OPEN_TOKENS = Object.values(PAIRS);
var CLOSE_TOKENS = Object.keys(PAIRS);
function blockTracker() {
  const blocks = [];
  function digest(input) {
    let change = 0;
    input.split("").forEach((token) => {
      if (OPEN_TOKENS.includes(token)) {
        change += 1;
        blocks.push(token);
      }
      if (CLOSE_TOKENS.includes(token)) {
        const last = blocks.pop();
        change -= 1;
        if (!last) {
          throw new Error(`Unexpected '${token}'`);
        }
        if (PAIRS[token] !== last) {
          throw new Error(`Expected '${last}' but found '${token}'`);
        }
      }
    });
    if (change > 0) {
      return "open";
    }
    if (change < 0) {
      return "close";
    }
    return "balanced";
  }
  function isOpen() {
    return blocks.length > 0;
  }
  return {
    blocks,
    digest,
    isOpen
  };
}

// ../parser/src/index.ts
var OPEN = "<%";
var CLOSE = "%>";
var EXPRESSION = "=";
var TRIM = "-";
function isExpression(token) {
  return token.startsWith(EXPRESSION);
}
function hasLeadingTrim(token) {
  return token.startsWith(TRIM);
}
function hasLaggingTrim(token) {
  return token.endsWith(TRIM);
}
function stripModifierToken(token) {
  let stripped = token;
  if (isExpression(token) || hasLeadingTrim(token)) {
    stripped = stripped.slice(1);
  }
  if (hasLaggingTrim(token)) {
    stripped = stripped.slice(0, -1);
  }
  return stripped;
}
function isParseError(parsed) {
  return typeof parsed === "object" && "error" in parsed;
}
function lineAndColumn(template, index) {
  var _a, _b;
  const lines = template.slice(0, index).split("\n");
  const line = lines.length;
  const column = ((_b = (_a = lines.pop()) == null ? void 0 : _a.length) != null ? _b : 0) + 1;
  return {
    line,
    column
  };
}
function formatContext(template, position) {
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
  endIdx
}) {
  const start = lineAndColumn(template, startIdx);
  const end = lineAndColumn(template, endIdx);
  return {
    error,
    position: {
      start,
      end
    },
    context: formatContext(template, start)
  };
}
function parse(template) {
  const parsed = [];
  const block = blockTracker();
  let position = 0;
  while (position < template.length) {
    const openIdx = template.indexOf(OPEN, position);
    const closeIdx = template.indexOf(CLOSE, position);
    if (!isPresent(openIdx) && !isPresent(closeIdx)) {
      const text2 = template.slice(position);
      if (isWhitespace(text2)) {
        break;
      }
      const firstCharacterIndex = position + text2.search(/\S/);
      return parseError({
        error: "Expected text to be inside a block",
        template,
        startIdx: firstCharacterIndex,
        endIdx: template.length - 1
      });
    }
    if (!isPresent(openIdx) && isPresent(closeIdx) || isPresent(openIdx) && isPresent(closeIdx) && closeIdx < openIdx) {
      return parseError({
        error: `Unexpected closing tag '${CLOSE}'`,
        template,
        startIdx: closeIdx,
        endIdx: closeIdx + CLOSE.length - 1
      });
    }
    if (isPresent(openIdx) && !isPresent(closeIdx)) {
      return parseError({
        error: `Expected to find corresponding closing tag '${CLOSE}' before end of template`,
        template,
        startIdx: openIdx,
        endIdx: template.length - 1
      });
    }
    const nextOpenIdx = template.indexOf(OPEN, openIdx + OPEN.length);
    if (isPresent(nextOpenIdx) && nextOpenIdx < closeIdx) {
      return parseError({
        error: `Unexpected opening tag '${OPEN}'`,
        template,
        startIdx: nextOpenIdx,
        endIdx: nextOpenIdx + OPEN.length - 1
      });
    }
    const text = template.slice(position, openIdx);
    if (block.isOpen()) {
      parsed.push({type: "text", content: text});
    } else if (!isWhitespace(text)) {
      const firstCharacterIndex = position + text.search(/\S/);
      return parseError({
        error: "Expected text to be inside a block",
        template,
        startIdx: firstCharacterIndex,
        endIdx: template.length - 1
      });
    }
    const code = template.slice(openIdx + OPEN.length, closeIdx).trim();
    const content = stripModifierToken(code).trim();
    if (isExpression(code)) {
      parsed.push({
        type: "expression",
        content,
        context: {trimLagging: hasLaggingTrim(code)}
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
              isRoot: !wasAlreadyOpen
            }
          });
          break;
        }
        case "close": {
          const isRoot = block.blocks.length === 0;
          parsed.push({
            type: "blockClose",
            content,
            context: {
              isRoot
            }
          });
          break;
        }
        case "balanced": {
          parsed.push({type: "statement", content});
          break;
        }
        default: {
          const exhaust = state;
          return exhaust;
        }
      }
    }
    position = closeIdx + CLOSE.length;
  }
  return parsed;
}

// ../compiler/src/index.ts
function isStatementNode(node) {
  return ["statement", "blockOpen", "blockClose"].includes(node.type);
}
var RESULT = "result";
function compile(nodes) {
  let compiled = "";
  nodes.forEach((node, idx) => {
    switch (node.type) {
      case "text": {
        let content = node.content;
        const prevNode = nodes[idx - 1];
        if (prevNode && (isStatementNode(prevNode) || prevNode.type === "expression" && prevNode.context.trimLagging)) {
          content = trimLagging(content);
        }
        const nextNode = nodes[idx + 1];
        if (nextNode && isStatementNode(nextNode)) {
          content = trimLeading(content);
        }
        if (content) {
          compiled += `${RESULT} += '${sanitizeString(content)}';
`;
        }
        break;
      }
      case "expression": {
        compiled += `${RESULT} += ${node.content};
`;
        break;
      }
      case "statement": {
        compiled += `${node.content}
`;
        break;
      }
      case "blockOpen": {
        compiled += `${node.content}
`;
        if (node.context.isRoot) {
          compiled += `let ${RESULT} = '';
`;
        }
        break;
      }
      case "blockClose": {
        if (node.context.isRoot) {
          compiled += `return ${RESULT};
`;
        }
        compiled += `${node.content}
`;
        break;
      }
      default: {
        const exhaust = node;
        return exhaust;
      }
    }
  });
  return compiled;
}
function compiler(template) {
  const parsed = parse(template);
  if (isParseError(parsed)) {
    return parsed;
  }
  return compile(parsed);
}

// src/cli.ts
function getConfig() {
  const cwd = process.cwd();
  const defaultConfig = {
    source: cwd
  };
  const configFilePath = (0, import_path.join)(cwd, ".ets.json");
  let userConfig = {};
  if ((0, import_fs.existsSync)(configFilePath)) {
    console.info(`Using configuration file at '${configFilePath}'.`);
    const userConfigFile = (0, import_fs.readFileSync)(configFilePath, "utf8");
    try {
      userConfig = JSON.parse(userConfigFile);
    } catch {
      console.error(`Failed to parse configuration file.`);
      process.exit(1);
    }
    const unknownKeys = Object.keys(userConfig).filter((key) => !defaultConfig.hasOwnProperty(key));
    if (unknownKeys.length) {
      console.warn(`Found unknown configuration options: ${unknownKeys.map((k) => `'${k}'`).join(", ")}.`);
    }
    console.info();
  }
  return __spreadValues(__spreadValues({}, defaultConfig), userConfig);
}
function findFiles(entry, ext) {
  return (0, import_fs.readdirSync)(entry).flatMap((file) => {
    const filepath = (0, import_path.join)(entry, file);
    if ((0, import_fs.statSync)(filepath).isDirectory()) {
      return findFiles(filepath, ext);
    }
    return filepath;
  }).filter((file) => file.endsWith(ext));
}
function run() {
  const {source} = getConfig();
  const templates = findFiles(source, ".ets");
  const created = new Set();
  const updated = new Set();
  const unchanged = new Set();
  templates.forEach((template) => {
    const output = template + ".ts";
    const templatePath = `./${(0, import_path.basename)(template)}`;
    let compiledTemplate = `// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.
// Source: ${templatePath}

`;
    const out = compiler((0, import_fs.readFileSync)(template, "utf8"));
    if (isParseError(out)) {
      console.error(`error: ${out.error}`);
      console.error(`   --> ${templatePath}:${out.position.start.line}:${out.position.start.column}`);
      console.error(out.context);
      console.warn();
      return;
    }
    compiledTemplate += out;
    function writeFileIfChange(name, filepath, contents) {
      if (!(0, import_fs.existsSync)(filepath)) {
        (0, import_fs.writeFileSync)(filepath, contents);
        created.add(name);
      } else if (contents !== (0, import_fs.readFileSync)(filepath).toString()) {
        (0, import_fs.writeFileSync)(filepath, contents);
        updated.add(name);
      } else {
        unchanged.add(name);
      }
    }
    writeFileIfChange(output, output, compiledTemplate);
  });
  if (created.size) {
    console.log(`Created:
${Array.from(created).sort().map((name) => ` - ${name}`).join("\n")}
`);
  }
  if (updated.size) {
    console.log(`Updated:
${Array.from(updated).sort().map((name) => ` - ${name}`).join("\n")}
`);
  }
  if (unchanged.size) {
    console.log(`Unchanged: ${unchanged.size}`);
  }
}

// src/index.ts
run();
