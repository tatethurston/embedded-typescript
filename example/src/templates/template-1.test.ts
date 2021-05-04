import { render } from "./template-1.ets";

const OUTPUT = `\
Name: Tate
Name: Emily
`;

describe("template-1", () => {
  it("renders expected output", () => {
    const input = [{ name: "Tate" }, { name: "Emily" }];
    expect(render(input)).toEqual(OUTPUT);
  });
});
