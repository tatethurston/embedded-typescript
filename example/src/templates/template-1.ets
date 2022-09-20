---
export interface Props {
  users: { name: string }[];
}
---
<% props.users.forEach(function(user) { %>
Name: <%= user.name %>
<% }) %>
