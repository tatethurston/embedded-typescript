<% type User = { name: string; } %>
<% export function render(users: User[]): string { %>
  <% users.forEach(function(user) { %>
Name: <%= user.name %>
  <% }) %>
<% } %>
