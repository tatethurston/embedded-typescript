import { parse } from ".";

describe(parse, () => {
  describe("errors", () => {
    it("missing template marker end", () => {
      expect(
        parse(`\
type User = { name: string; }

export function render(users: User[]): string {
  return <%>
  %>
  <% users.forEach(function(user) { %>
Name: <%= user.name %>
  <% }) %>
}`)
      ).toMatchInlineSnapshot(`
        Object {
          "context": "    |
        4   |   return <%>
            |          ^
            |          |
        ...
        ",
          "error": "Expected to find corresponding closing tag '<%>' before end of file",
          "position": Object {
            "end": Object {
              "column": 1,
              "line": 9,
            },
            "start": Object {
              "column": 10,
              "line": 4,
            },
          },
        }
      `);
    });

    it("closing tag before open tag", () => {
      expect(
        parse(`\
type User = { name: string; }

export function render(users: User[]): string {
  return <%>
  %>
  <% users.forEach(function(user) { %>
Name: <%= user.name %>
  <% }) %>
  <%>
}`)
      ).toMatchInlineSnapshot(`
        Object {
          "context": "    |
        5   |   %>
            |   ^
            |   |
        ...
        ",
          "error": "Unexpected closing tag '%>'",
          "position": Object {
            "end": Object {
              "column": 4,
              "line": 5,
            },
            "start": Object {
              "column": 3,
              "line": 5,
            },
          },
        }
      `);
    });

    it("missing ending closing tag", () => {
      expect(
        parse(`\
type User = { name: string; }

export function render(users: User[]): string {
  return <%>
  <% users.forEach(function(user) { %>
Name: <%= user.name %>
  <% })
  <%>
}`)
      ).toMatchInlineSnapshot(`
        Object {
          "context": "    |
        7   |   <% })
            |   ^
            |   |
        ...
        ",
          "error": "Expected to find corresponding closing tag '%>' before end of template",
          "position": Object {
            "end": Object {
              "column": 3,
              "line": 8,
            },
            "start": Object {
              "column": 3,
              "line": 7,
            },
          },
        }
      `);
    });

    it("extra opening tag", () => {
      expect(
        parse(`\
type User = { name: string; }

export function render(users: User[]): string {
  return <%>
  <% <% users.forEach(function(user) { %>
Name: <%= user.name %>
  <% }) %>
  <%>
}`)
      ).toMatchInlineSnapshot(`
        Object {
          "context": "    |
        5   |   <% <% users.forEach(function(user) { %>
            |      ^
            |      |
        ...
        ",
          "error": "Unexpected opening tag '<%'",
          "position": Object {
            "end": Object {
              "column": 7,
              "line": 5,
            },
            "start": Object {
              "column": 6,
              "line": 5,
            },
          },
        }
      `);
    });
  });
});
