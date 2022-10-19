import render from "./template-4.ets";

describe("template-4", () => {
  it("renders OUTPUT1", () => {
    const input = { name: "Tate" };
    expect(render(input)).toMatchInlineSnapshot(`"Hello TATE!"`);
  });
});
