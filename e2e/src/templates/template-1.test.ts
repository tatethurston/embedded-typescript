import render from "./template-1.ets";

describe("template-1", () => {
  it("renders expected output", () => {
    const input = { users: [{ name: "Tate" }, { name: "Emily" }] };
    expect(render(input)).toMatchInlineSnapshot(`
      "Name: Tate
      Name: Emily
      "
    `);
  });
});
