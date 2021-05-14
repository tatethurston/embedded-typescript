type Account = {
  name: string;
  needsPasswordReset: boolean;
}

export function render({ name, needsPasswordReset }: Account): string {
  return <%>
Hello <%= name %>!
<% if (needsPasswordReset) { %>
You need to update your password.
<% } %>
  <%>
}

