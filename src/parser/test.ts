import { parse } from ".";

describe(parse, () => {
  describe("errors", () => {
    it("text outside of block (no code)", () => {
      expect(parse(`           bob`)).toEqual({
        context: `    |
1   |            bob
    |            ^
    |            |

`,
        error: "Expected text to be inside a block",
        position: {
          line: 1,
          column: 12,
        },
      });
    });

    it("text outside of block (with following code)", () => {
      expect(
        parse(
          `           bob
<% type User = { name: string; } %>
<% export function render(users: User[]): string { %>
  <% users.forEach(function(user) { %>
Name: <%= user.name %>
  <% }) %>
<% } %>
`
        )
      ).toEqual({
        error: "Expected text to be inside a block",
        position: {
          line: 1,
          column: 12,
        },
        context: `    |
1   |            bob
    |            ^
    |            |
...
`,
      });
    });

    it("text outside of block (without following code)", () => {
      expect(
        parse(
          `<% type User = { name: string; } %>
<% export function render(users: User[]): string { %>
  <% users.forEach(function(user) { %>
Name: <%= user.name %>
  <% }) %>
<% } %>
           bob`
        )
      ).toEqual({
        error: "Expected text to be inside a block",
        position: {
          line: 7,
          column: 12,
        },
        context: `    |
7   |            bob
    |            ^
    |            |

`,
      });
    });

    it("closing tag before open tag", () => {
      expect(
        parse(
          `%>
<% type User = { name: string; } %>
<% export function render(users: User[]): string { %>
  <% users.forEach(function(user) { %>
Name: <%= user.name %>
  <% }) %>
<% } %>`
        )
      ).toEqual({
        error: "Unexpected closing tag '%>'",
        position: {
          line: 1,
          column: 1,
        },
        context: `    |
1   | %>
    | ^
    | |
...
`,
      });
    });

    it("extra closing tag", () => {
      expect(
        parse(
          `<% type User = { name: string; } %>
<% export function render(users: User[]): string { %>
  <% users.forEach(function(user) { %>
Name: <%= user.name %>
  <% }) %>
<%`
        )
      ).toEqual({
        error:
          "Expected to find corresponding closing tag '%>' before end of template",
        position: {
          line: 6,
          column: 1,
        },
        context: `    |
6   | <%
    | ^
    | |

`,
      });
    });

    it("extra opening tag", () => {
      expect(
        parse(
          `<%   <%
<% type User = { name: string; } %>
<% export function render(users: User[]): string { %>
  <% users.forEach(function(user) { %>
Name: <%= user.name %>
  <% }) %>
<% } %>`
        )
      ).toEqual({
        error: "Unexpected opening tag '<%'",
        position: {
          line: 1,
          column: 6,
        },
        context: `    |
1   | <%   <%
    |      ^
    |      |
...
`,
      });
    });
  });
});
