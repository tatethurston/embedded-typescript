import { join } from "path";
import { readdirSync, readFileSync } from "fs";
import { compiler } from "./index.js";

const templatePath = "../../e2e/src/templates/";

const templates = readdirSync(join(__dirname, templatePath)).filter(
  (filename) => filename.endsWith(".ets")
);

describe(compiler, () => {
  it.each(templates)("compile(%s)", (filename) => {
    const template = readFileSync(
      join(__dirname, templatePath, filename),
      "utf8"
    );
    expect(compiler(template, filename)).toMatchSnapshot();
  });
});
