import render from "./template-2.ets";

describe("template-2", () => {
  it("renders OUTPUT1", () => {
    const input = { name: "Tate", needsPasswordReset: false };
    expect(render(input)).toMatchInlineSnapshot(`
      "Hello Tate!
      "
    `);
  });

  it("renders OUTPUT2", () => {
    const input = { name: "Tate", needsPasswordReset: true };
    expect(render(input)).toMatchInlineSnapshot(`
      "Hello Tate!
      You need to update your password.
      "
    `);
  });
});
