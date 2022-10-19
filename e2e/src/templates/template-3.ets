---
type AccountType = 'user' | 'admin' | 'enterprise';

export interface Props {
  name: string;
  type: AccountType;
}
---
Hello <%= props.name %>, you are <%
switch (props.type) { %>
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
    const exhaust: never = props.type;
    return exhaust;
  } %>
<% } %>
