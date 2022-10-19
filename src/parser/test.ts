import { parse } from "./index.js";

describe(parse, () => {
  describe("errors", () => {
    it("closing tag before open tag", () => {
      expect(
        parse(`\
---
type Props = { name: string; }
---
%>
<% users.forEach(function(user) { %>
Name: <%= user.name %>
<% }) %>\
`)
      ).toMatchInlineSnapshot(`
        {
          "context": "    |
        4   | %>
            | ^
            | |
        ...
        ",
          "error": "Unexpected closing tag '%>'",
          "position": {
            "end": {
              "column": 2,
              "line": 4,
            },
            "start": {
              "column": 1,
              "line": 4,
            },
          },
        }
      `);
    });

    it("missing ending closing tag", () => {
      expect(
        parse(`\
---
type Props = { name: string; }
---
<% users.forEach(function(user) { %>
Name: <%= user.name %>
<% })`)
      ).toMatchInlineSnapshot(`
        {
          "context": "    |
        6   | <% })
            | ^
            | |

        ",
          "error": "Expected to find corresponding closing tag '%>' before end of template",
          "position": {
            "end": {
              "column": 5,
              "line": 6,
            },
            "start": {
              "column": 1,
              "line": 6,
            },
          },
        }
      `);
    });

    it("extra opening tag", () => {
      expect(
        parse(`\
---
type Props = { name: string; }
---
<% <% users.forEach(function(user) { %>
Name: <%= user.name %>
<% }) %>`)
      ).toMatchInlineSnapshot(`
        {
          "context": "    |
        4   | <% <% users.forEach(function(user) { %>
            |    ^
            |    |
        ...
        ",
          "error": "Unexpected opening tag '<%'",
          "position": {
            "end": {
              "column": 5,
              "line": 4,
            },
            "start": {
              "column": 4,
              "line": 4,
            },
          },
        }
      `);
    });
  });
});
