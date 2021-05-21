import { join } from "path";
import { readdirSync, readFileSync } from "fs";
import { compiler } from ".";

const templatePath = "../../../example/src/templates/";

const templates = readdirSync(join(__dirname, templatePath)).filter(
  (filename) => filename.endsWith(".ets")
);

describe(compiler, () => {
  it.each(templates)("compile(%s)", (filename) => {
    const template = readFileSync(
      join(__dirname, templatePath, filename),
      "utf8"
    );
    expect(compiler(template)).toMatchSnapshot();
  });
});
