type AccountType = 'user' | 'admin' | 'enterprise';

interface Account {
  name: string;
  type: AccountType;
}

export const render = ({ name, type}: Account): string => {
  const userMessage = <%>
<% switch (type) { %>
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
<%>

  return <%>Hello <%= name %>, you are <%= userMessage %><%>
}
