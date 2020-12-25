import {
  readdirSync,
  existsSync,
  readFileSync,
  writeFileSync,
  statSync,
} from "fs";
import { join } from "path";
import { compiler } from "../compiler";

export type UserConfig = Partial<Config>;

type Config = { source: string };

function getConfig(): Config {
  const cwd = process.cwd();

  const defaultConfig = {
    source: cwd,
  };

  const configFilePath = join(cwd, ".ets.json");

  let userConfig: UserConfig = {};
  if (existsSync(configFilePath)) {
    console.info(`Using configuration file at '${configFilePath}'.`);
    const userConfigFile = readFileSync(configFilePath, "utf8");
    try {
      userConfig = JSON.parse(userConfigFile) as UserConfig;
    } catch {
      console.error(`Failed to parse configuration file.`);
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

export function run(): void {
  const { source } = getConfig();
  const templates = findFiles(source, ".ets");

  const created = new Set<string>();
  const updated = new Set<string>();
  const unchanged = new Set<string>();
  templates.forEach((template) => {
    let compiledTemplate;
    const output = template + ".ts";
    try {
      compiledTemplate = compiler(readFileSync(template, "utf8"));
    } catch (e) {
      console.warn(`Failed to compile '${template}'`);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      console.warn(e.message);
      console.warn();
      return;
    }

    function writeFileIfChange(
      name: string,
      filepath: string,
      contents: string
    ): void {
      if (!existsSync(filepath)) {
        writeFileSync(filepath, contents);
        created.add(name);
      } else if (contents !== readFileSync(filepath).toString()) {
        writeFileSync(filepath, contents);
        updated.add(name);
      } else {
        unchanged.add(name);
      }
    }

    writeFileIfChange(output, output, compiledTemplate);
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
