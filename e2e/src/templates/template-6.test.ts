import render from "./template-6.ets";

describe("template-6", () => {
  it("renders OUTPUT1", () => {
    const input = {
      users: [
        { name: "Tate", phone: "888-888-8888", email: "tate@tate.com" },
        { name: "Emily", phone: "777-777-7777", email: "emily@emily.com" },
      ],
    };
    expect(render(input)).toMatchInlineSnapshot(`
      "Here is a list of users:

        Name: Tate
        Email: tate@tate.com
        Phone: 888-888-8888

        Name: Emily
        Email: emily@emily.com
        Phone: 777-777-7777

      The indentation level is preserved for the rendered 'partial'.

      There isn't anything special about the 'partial'. Here we used another ets template, but any
      expression yeilding a multiline string would be treated the same.

        1
        2
        3
        4

      The end!"
    `);
  });

  it("renders OUTPUT2", () => {
    expect(render({ users: [] })).toMatchInlineSnapshot(`
      "The indentation level is preserved for the rendered 'partial'.

      There isn't anything special about the 'partial'. Here we used another ets template, but any
      expression yeilding a multiline string would be treated the same.

        1
        2
        3
        4

      The end!"
    `);
  });
});
