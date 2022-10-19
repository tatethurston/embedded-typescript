---
export interface Props {
  name: string;
  needsPasswordReset: boolean;
}
---
Hello <%= props.name %>!
<% if (props.needsPasswordReset) { %>
You need to update your password.
<% } %>
