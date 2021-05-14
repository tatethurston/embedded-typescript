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
