import { render } from "./template-2.ets";

const OUTPUT1 = `\
Hello Tate!
`;

const OUTPUT2 = `\
Hello Tate!
You need to update your password.
`;

describe("template-2", () => {
  it("renders OUTPUT1", () => {
    const input = { name: "Tate", needsPasswordReset: false };
    expect(render(input)).toEqual(OUTPUT1);
  });

  it("renders OUTPUT2", () => {
    const input = { name: "Tate", needsPasswordReset: true };
    expect(render(input)).toEqual(OUTPUT2);
  });
});
