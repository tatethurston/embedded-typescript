import { render } from "./template-3.ets";

const OUTPUT1 = `\
Hello Tate, you are a user!
`;

const OUTPUT2 = `\
Hello Tate, you are an admin!
`;

const OUTPUT3 = `\
Hello Tate, you are an enterprise user!
`;

describe("template-3", () => {
  it("renders OUTPUT1", () => {
    const input = { name: "Tate", type: "user" as const };
    expect(render(input)).toEqual(OUTPUT1);
  });

  it("renders OUTPUT2", () => {
    const input = { name: "Tate", type: "admin" as const };
    expect(render(input)).toEqual(OUTPUT2);
  });

  it("renders OUTPUT3", () => {
    const input = { name: "Tate", type: "enterprise" as const };
    expect(render(input)).toEqual(OUTPUT3);
  });
});
