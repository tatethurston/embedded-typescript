import { render } from "./template-4.ets";

const OUTPUT1 = `\
Hello TATE!
`;

describe("template-4", () => {
  it("renders OUTPUT1", () => {
    const input = "Tate";
    expect(render(input)).toEqual(OUTPUT1);
  });
});
