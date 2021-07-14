# Embedded TypeScript

<blockquote>Type safe embedded TypeScript templates</blockquote>

<br />

<a href="https://www.npmjs.com/package/embedded-typescript">
  <img src="https://img.shields.io/npm/v/embedded-typescript.svg">
</a>
<a href="https://github.com/tatethurston/embedded-typescript/blob/master/LICENSE">
  <img src="https://img.shields.io/npm/l/embedded-typescript.svg">
</a>
<a href="https://bundlephobia.com/result?p=embedded-typescript">
  <img src="https://img.shields.io/bundlephobia/minzip/embedded-typescript">
</a>
<a href="https://www.npmjs.com/package/embedded-typescript">
  <img src="https://img.shields.io/npm/dy/embedded-typescript.svg">
</a>
<a href="https://github.com/tatethurston/embedded-typescript/actions/workflows/ci.yml">
  <img src="https://github.com/tatethurston/embedded-typescript/actions/workflows/ci.yml/badge.svg">
</a>

## What is this? 🧐

A type safe templating system for TypeScript. Templates are compiled to TypeScript files that are then imported for type safe string generation.

This templating system draws inspiration from ERB, [EJS](https://ejs.co/), [handlebars](https://handlebarsjs.com/) and [mustache](https://github.com/janl/mustache.js). This project embraces the "just JavaScript" spirit of ejs and adds some of the helpful white space semantics of mustache.

Checkout the [examples](#examples-) or [play with embedded-typescript in your browser](https://codesandbox.io/s/ets-playground-9mzk8).

## Installation & Usage 📦

1. Add this package to your project:
   - `yarn add embedded-typescript`

## Motivation

`Hello undefined!`

When using a typed language, I want my templates to be type checked. For most cases, [template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) work well. If I'm writing HTML/XML, [JSX](https://www.typescriptlang.org/docs/handbook/jsx.html) works well. When I'm writing text templates, template literals quickly become difficult to maintain as the template complexity grows. I can switch to [EJS](https://ejs.co/), [handlebars](https://handlebarsjs.com/), [mustache](https://github.com/janl/mustache.js), etc, but then I lose the type safety I had with template literals. Sometimes I want the expressiveness of a templating language without losing type safety. For those cases, I wrote `embedded-typescript`.

## Syntax

`<%>` — Begin or end a templated region. The syntax below is only valid inside a templated region.

`<%= EXPRESSION %>` — Inserts the value of an expression. If the expression generates multiple lines, the indentation level is preserved across all resulting lines.

`<% CODE %>` — Executes code, but does not insert a value.

`TEXT` - Text literals are inserted as is. All white space is preserved.

## Examples 🚀

#### Minimal

1. Write a template file: `my-template.ets`:

```typescript
interface User {
  name: string;
}

export function render(users: User[]): string {
  return <%>
    <% users.forEach(function(user) { %>
Name: <%= user.name %>
    <% }) %>
  <%>
}
```

2. Run the compiler: `yarn ets`. This will compile any files with the `.ets` extension. `my-template.ets.ts` will be generated.

3. Import the generated `.ets.ts` file wherever you'd like to render your template:

```typescript
import { render } from "./my-template.ets";

/* will output:
Name: Alice
Name: Bob
*/

console.log(render([{ name: "Alice" }, { name: "Bob" }]));
```

Note that the arguments to your template function are type checked. There isn't anything special about the `render` export, in our template file this could have been named anything, such as `printUserNames`.

#### Partials

Embedded TypeScript preserves the indentation wherever an `expression` tag (`<%= EXPRESSION %>`) is used. This means there isn't any special syntax for partials, and `ets` templates nest as you would expect.

1. Write a "partial" `user-partial.ets`:

```typescript
export interface User {
  name: string;
  email: string;
  phone: string;
}

export function render(user: User): string {
  return <%>
Name: <%= user.name %>
Email: <%= user.email %>
Phone: <%= user.phone %>
  <%>
}
```

Note there is nothing special about `user-partial.ets`, it's just an `ets` template. We're using the `-patial` suffix purely for illustration.

2. Import your "partial" into another `ets` template `my-template-2.ets`:

```typescript
import { render as renderUser, User } from './user-partial.ets';

const example =
`1
2
3
4`;

export function render(users: User[]): string {
  return <%>
<% if (users.length > 0) { %>
Here is a list of users:

  <% users.forEach(function(user) { %>
  <%= renderUser(user) %>
  <% }) %>

<% } %>
The indentation level is preserved for the rendered 'partial'.

There isn't anything special about the 'partial'. Here we used another `ets` template, but any
expression yeilding a multiline string would be treated the same.

  <%= example %>

The end!
  <%>
}
```

3. Run the compiler: `yarn ets`.

4. Import the generated `my-template-2.ets.ts` file wherever you'd like to render your template:

```typescript
import { render } from "./my-template-2.ets";

/* will output:
Here is a list of users:

  Name: Tate
  Email: tate@tate.com
  Phone: 888-888-8888

  Name: Emily
  Email: emily@emily.com
  Phone: 777-777-7777

The indentation level is preserved for the rendered 'partial'.

There isn't anything special about the 'partial'. Here we used another `ets` template, but any
expression yielding a multi-line string would be treated the same.

  1
  2
  3
  4

The end!
*/

console.log(
  render([
    { name: "Tate", phone: "888-888-8888", email: "tate@tate.com" },
    { name: "Emily", phone: "777-777-7777", email: "emily@emily.com" },
  ])
);
```

Note that above the indentation was preserved for both `render` from `user-partial.ets` and the `example` string literal. Any expression yielding a multi-line string rendered inside an `expresssion` block (`<%= EXPRESSION %>`) will preserve the indentation across each line.

#### More Examples

For more examples, take a look at the [example directory](https://github.com/tatethurston/embedded-typescript/blob/main/example). The `*.ets.ts` files are generated by the compiler from the `*.ets` template files. The corresponding `*${NAME}.test.ts` shows example usage and output.

## Understanding Error Messages

The compiler will output errors when it encounters invalid syntax:

```
error: Unexpected closing tag '%>'
   --> ./template-1.ets:4:41
    |
4   | <% users.forEach(function(user) { %>%>
    |                                     ^
    |                                     |
...
```

The first line is a description of the error that was encountered.

The second line is location of the error, in `path:line:column` notation.

The next 5 lines provide visual context for the error.

## Notable deviations from prior art

Rather than treating the entire contents of an input file as templated text, `embedded-typescript` templates explicitly indicate templated regions (delimited by`<%>`). This symbol is used to both start and end a templated region. Outside of a templating region file contents are treated as TypeScript. This enables complete control over the namespace: you explicitly specify exports and their type signature. Because it's just TypeScript, outside of a templated region, you can `import` any helpers, utilities, partials, etc. If you've worked with JSX things should feel familiar.

This tool specifically targets text templating, rather than HTML templating. Think: code generation, text message content (emails or SMS), etc. HTML templating is possible with this tool, but I would generally recommend JSX instead for HTML cases.

The templating system does _not_ perform any HTML escaping. You can `import` any self authored or 3rd party HTML escaping utilities in your template, and call that directly on any untrusted input:

```typescript
import htmlescape from 'htmlescape';

interface User {
  name: string;
}

export function render(users: User[]): string {
  return <%>
    <% users.forEach(function(user) { %>
<p>Name: <%= htmlescape(user.name) %></p>
    <% }) %>
  <%>
}
```

I'm not aware of any other templating systems that preserve indentation for partials and multi-line strings like Embedded-TypeScript. Many templating libraries target HTML so this is not surprising, but I've found this functionality nice for text templates.

## Highlights

🎁 Zero run time dependencies

## Contributing 👫

PR's and issues welcomed! For more guidance check out [CONTRIBUTING.md](https://github.com/tatethurston/embedded-typescript/blob/master/CONTRIBUTING.md)

## Licensing 📃

See the project's [MIT License](https://github.com/tatethurston/embedded-typescript/blob/master/LICENSE).
