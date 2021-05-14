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
