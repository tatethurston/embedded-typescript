# Changelog

## 0.1.0

This is a rewrite of `embedded-typescript` and a major breaking change.

`embedded-typescript` now generates a single function per `.ets` template. This significantly cuts down on the syntax noise and improves ergonomics for the common use case.

Previously:

// users.ets

```
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

Now:

// users.ets

```
---
interface Props {
  users: { name: string }[];
}
---
<% props.users.forEach(function(user) { %>
Name: <%= user.name %>
<% }) %>
```
