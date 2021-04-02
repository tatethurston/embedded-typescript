<% type AccountType = 'user' | 'admin' | 'enterprise' %>

<% type Account = {
  name: string;
  type: AccountType;
} %>

<% export function render({ name, type}: Account): string { %>
Hello <%= name %>, you are <% switch (type) { %>
  <% case 'user': { %>
a user!
  <% break; } %>
  <% case 'admin': { %>
an admin!
  <% break; } %>
  <% case 'enterprise': { %>
an enterprise user!
  <% break; } %>
  <% default: {
    const exhaust: never = type;
    return exhaust;
   } %>
<% } %>
<% } %>
