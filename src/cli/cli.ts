import {
  readdirSync,
  existsSync,
  readFileSync,
  writeFileSync,
  statSync,
} from "fs";
import { basename, join } from "path";
import { compiler } from "../compiler/index.js";
import { isParseError } from "../parser/index.js";

export type UserConfig = Partial<Config>;

type Config = { source: string };

function getConfigFilePath(): string | undefined {
  const cwd = process.cwd();
  for (const ext of [".js", ".mjs", ".cjs"]) {
    const path = join(cwd, "ets.config") + ext;
    if (existsSync(path)) {
      return path;
    }
  }
}

async function getConfig(): Promise<Config> {
  const cwd = process.cwd();

  const defaultConfig = {
    source: cwd,
  };

  const configFilePath = getConfigFilePath();
  let userConfig: UserConfig = {};
  if (configFilePath) {
    console.info(`Using configuration file at '${configFilePath}'.`);
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      userConfig = (await import(configFilePath)).default;
    } catch (e) {
      console.error(`Failed to load configuration file:`);
      console.log(e);
      process.exit(1);
    }

    const unknownKeys = Object.keys(userConfig).filter(
      // eslint-disable-next-line no-prototype-builtins
      (key) => !defaultConfig.hasOwnProperty(key)
    );
    if (unknownKeys.length) {
      console.warn(
        `Found unknown configuration options: ${unknownKeys
          .map((k) => `'${k}'`)
          .join(", ")}.`
      );
    }
    console.info();
  }

  return {
    ...defaultConfig,
    ...userConfig,
  };
}

function findFiles(entry: string, ext: string): string[] {
  return readdirSync(entry)
    .flatMap((file) => {
      const filepath = join(entry, file);
      if (statSync(filepath).isDirectory()) {
        return findFiles(filepath, ext);
      }
      return filepath;
    })
    .filter((file) => file.endsWith(ext));
}

export async function run(): Promise<void> {
  const { source } = await getConfig();
  const templates = findFiles(source, ".ets");

  const created = new Set<string>();
  const updated = new Set<string>();
  const unchanged = new Set<string>();
  templates.forEach((template) => {
    const destFile = template + ".ts";
    const templatePath = `./${basename(template)}`;
    const out = compiler(readFileSync(template, "utf8"), templatePath);
    if (isParseError(out)) {
      console.error(`error: ${out.error}`);
      console.error(
        `   --> ${templatePath}:${out.position.start.line}:${out.position.start.column}`
      );
      console.error(out.context);
      console.warn();
      return;
    }

    function writeFileIfChange(filepath: string, contents: string): void {
      if (!existsSync(filepath)) {
        writeFileSync(filepath, contents);
        created.add(filepath);
      } else if (contents !== readFileSync(filepath).toString()) {
        writeFileSync(filepath, contents);
        updated.add(filepath);
      } else {
        unchanged.add(filepath);
      }
    }

    writeFileIfChange(destFile, out);
  });

  if (created.size) {
    console.log(
      `Created:
${Array.from(created)
  .sort()
  .map((name) => ` - ${name}`)
  .join("\n")}
`
    );
  }

  if (updated.size) {
    console.log(
      `Updated:
${Array.from(updated)
  .sort()
  .map((name) => ` - ${name}`)
  .join("\n")}
`
    );
  }

  if (unchanged.size) {
    console.log(`Unchanged: ${unchanged.size}`);
  }
}
