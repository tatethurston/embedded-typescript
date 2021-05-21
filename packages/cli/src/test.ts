import { execSync } from "child_process";
import { run } from "./cli";

const consoleLog = jest.spyOn(console, "log").mockImplementation();
// mock the embedded-typescript's default src (from config).
jest.spyOn(process, "cwd").mockImplementation(() => __dirname);

describe("cli", () => {
  beforeAll(() => {
    execSync("rm packages/cli/src/**/*.ets.ts");
  });

  it("it prints written files", () => {
    run();
    // TODO: Absolute paths don't work on CI
    // expect(consoleLog.mock.calls).toMatchInlineSnapshot(`
    //   Array [
    //     Array [
    //       "Created:
    //    - /Users/tatethurston/embedded-typescript/packages/cli/src/templates/template-1.ets.ts
    //    - /Users/tatethurston/embedded-typescript/packages/cli/src/templates/template-2.ets.ts
    //    - /Users/tatethurston/embedded-typescript/packages/cli/src/templates/template-3.ets.ts
    //    - /Users/tatethurston/embedded-typescript/packages/cli/src/templates/template-4.ets.ts
    //    - /Users/tatethurston/embedded-typescript/packages/cli/src/templates/template-5.ets.ts
    //    - /Users/tatethurston/embedded-typescript/packages/cli/src/templates/template-6.ets.ts
    //    - /Users/tatethurston/embedded-typescript/packages/cli/src/templates/template-7.ets.ts
    //    - /Users/tatethurston/embedded-typescript/packages/cli/src/templates/user-partial.ets.ts
    //   ",
    //     ],
    //   ]
    // `);
  });

  it("it prints unchanged count", () => {
    run();
    expect(consoleLog.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "Unchanged: 8",
        ],
      ]
    `);
  });
});
