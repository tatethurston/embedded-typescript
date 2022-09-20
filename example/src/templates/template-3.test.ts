import render from "./template-3.ets";

describe("template-3", () => {
  it("renders OUTPUT1", () => {
    const input = { name: "Tate", type: "user" as const };
    expect(render(input)).toMatchInlineSnapshot(`
      "Hello Tate, you are a user!
      "
    `);
  });

  it("renders OUTPUT2", () => {
    const input = { name: "Tate", type: "admin" as const };
    expect(render(input)).toMatchInlineSnapshot(`
      "Hello Tate, you are an admin!
      "
    `);
  });

  it("renders OUTPUT3", () => {
    const input = { name: "Tate", type: "enterprise" as const };
    expect(render(input)).toMatchInlineSnapshot(`
      "Hello Tate, you are an enterprise user!
      "
    `);
  });
});
