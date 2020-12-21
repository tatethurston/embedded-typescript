<% type Account = {
  name: string;
  needsPasswordReset: boolean;
} %>

<% export function render({ name, needsPasswordReset }: Account): string { %>
Hello <%= name %>!
<% if (needsPasswordReset) { %>
You need to update your password.
<% } %>
<% } %>
