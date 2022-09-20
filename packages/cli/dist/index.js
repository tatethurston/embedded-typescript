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

// src/index.ts
__markAsModule(exports);

// src/cli.ts
var import_fs = __toModule(require("fs"));
var import_path = __toModule(require("path"));

// ../compiler/src/utils/index.ts
function sanitizeString(token) {
  return token.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/\n/g, "\\n");
}
var INDENTATION_TO_END_LINE_0 = /^[^\S\n]+$/;
var INDENTATION_TO_END_LINE_N = /\n([^\S\n]*)$/;
var START_TO_LINE_BREAK = /^[^\S\n]*\n/;
function getLeadingIndentation(token) {
  return token.match(INDENTATION_TO_END_LINE_0)?.[0] ?? token.match(INDENTATION_TO_END_LINE_N)?.[1] ?? "";
}
function trimLeadingIndentation(token) {
  if (token.match(INDENTATION_TO_END_LINE_0)) {
    return token.replace(INDENTATION_TO_END_LINE_0, "");
  }
  return token.replace(INDENTATION_TO_END_LINE_N, "\n");
}
function trimLaggingNewline(token) {
  return token.replace(START_TO_LINE_BREAK, "");
}
function trimLeadingIndentationAndNewline(token) {
  if (token.match(INDENTATION_TO_END_LINE_0)) {
    return token.replace(INDENTATION_TO_END_LINE_0, "");
  }
  return token.replace(INDENTATION_TO_END_LINE_N, "");
}

// ../parser/src/utils/index.ts
function isPresent(idx) {
  return idx !== -1;
}

// ../parser/src/index.ts
var TEMPLATE_MARKER = "<%>";
var OPEN = "<%";
var CLOSE = "%>";
var EXPRESSION = "=";
function isExpression(token) {
  return token.startsWith(EXPRESSION);
}
function stripModifierToken(token) {
  let stripped = token;
  if (isExpression(token)) {
    stripped = stripped.slice(1);
  }
  return stripped;
}
function isParseError(parsed) {
  return typeof parsed === "object" && parsed != null && "error" in parsed;
}
function lineAndColumn(template, index) {
  const lines = template.slice(0, index).split("\n");
  const line = lines.length;
  const column = (lines.pop()?.length ?? 0) + 1;
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
  let position = 0;
  while (position < template.length) {
    const templateStartIdx = template.indexOf(TEMPLATE_MARKER, position);
    const templateRegionStart = templateStartIdx + TEMPLATE_MARKER.length;
    if (!isPresent(templateStartIdx)) {
      parsed.push({
        type: "untemplated",
        content: template.slice(position)
      });
      break;
    }
    const templateEndIdx = template.indexOf(TEMPLATE_MARKER, templateRegionStart);
    const templateRegionEnd = templateEndIdx;
    if (isPresent(templateStartIdx) && !isPresent(templateEndIdx)) {
      return parseError({
        error: `Expected to find corresponding closing tag '${TEMPLATE_MARKER}' before end of file`,
        template,
        startIdx: templateStartIdx,
        endIdx: template.length - 1
      });
    }
    const text = template.slice(position, templateStartIdx);
    if (text.length) {
      parsed.push({type: "untemplated", content: text});
    }
    parsed.push({
      type: "templateMarker",
      content: "",
      context: {
        marker: "start"
      }
    });
    position = templateRegionStart;
    while (position < templateRegionEnd) {
      const region = template.slice(0, templateRegionEnd);
      const openIdx = region.indexOf(OPEN, position);
      const closeIdx = region.indexOf(CLOSE, position);
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
          endIdx: templateRegionEnd
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
      if (!isPresent(openIdx) && !isPresent(closeIdx)) {
        parsed.push({
          type: "text",
          content: region.slice(position, templateRegionEnd)
        });
        break;
      }
      const text2 = template.slice(position, openIdx);
      if (text2.length) {
        parsed.push({type: "text", content: text2});
      }
      const code = template.slice(openIdx + OPEN.length, closeIdx).trim();
      if (isExpression(code)) {
        parsed.push({
          type: "expression",
          content: stripModifierToken(code)
        });
      } else {
        parsed.push({type: "statement", content: code});
      }
      position = closeIdx + CLOSE.length;
    }
    position = templateRegionEnd + TEMPLATE_MARKER.length;
    parsed.push({
      type: "templateMarker",
      content: "",
      context: {
        marker: "end"
      }
    });
  }
  return parsed;
}

// ../compiler/src/index.ts
var RESULT = "result";
function compile(nodes) {
  let compiled = "";
  let indent = "";
  function write(text) {
    compiled += indent + text;
  }
  function preserveIndentation(text, indentation) {
    return text.toString().split("\n").map((line, idx) => idx === 0 ? line : indentation + line).join("\n");
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
        if (prevNode?.type === "statement") {
          content = trimLaggingNewline(content);
        } else if (prevNode?.type === "templateMarker" && prevNode.context.marker === "start") {
          content = trimLaggingNewline(content);
        }
        if (nextNode?.type === "statement") {
          content = trimLeadingIndentation(content);
        } else if (nextNode?.type === "templateMarker" && nextNode.context.marker === "end") {
          content = trimLeadingIndentationAndNewline(content);
        }
        if (content) {
          write(`${RESULT} += '${sanitizeString(content)}';
`);
        }
        break;
      }
      case "expression": {
        const indentation = getLeadingIndentation(prevNode.content ?? "");
        if (!indentation) {
          write(`${RESULT} += ${node.content};
`);
        } else {
          write(`${RESULT} += (${preserveIndentation.toString()})(${node.content}, '${indentation}');
`);
        }
        break;
      }
      case "statement": {
        write(`${node.content}
`);
        break;
      }
      case "templateMarker": {
        if (node.context.marker === "start") {
          indent = getLeadingIndentation(prevNode?.content ?? "");
          write(`(() => {
`);
          indent += "  ";
          write(`let ${RESULT} = '';
`);
        } else {
          write(`return ${RESULT};
`);
          write(`})()`);
          indent = "";
        }
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
function getConfigFilePath() {
  const cwd = process.cwd();
  for (const ext of [".js", ".mjs", ".cjs"]) {
    const path = (0, import_path.join)(cwd, ".ets") + ext;
    if ((0, import_fs.existsSync)(path)) {
      return path;
    }
  }
}
async function getConfig() {
  const cwd = process.cwd();
  const defaultConfig = {
    source: cwd
  };
  const configFilePath = getConfigFilePath();
  let userConfig = {};
  if (configFilePath) {
    console.info(`Using configuration file at '${configFilePath}'.`);
    try {
      userConfig = (await import(configFilePath)).default;
    } catch (e) {
      console.error(`Failed to load configuration file:`);
      console.log(e);
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
async function run() {
  const {source} = await getConfig();
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
