---
type AccountType = 'user' | 'admin' | 'enterprise';

export interface Props {
  name: string;
  type: AccountType;
}
---
<%
let userMessage;
switch (props.type) {
  case 'user': {
    userMessage = 'a user!';
    break;
  }
  case 'admin': {
    userMessage = 'an admin!';
    break;
  }
  case 'enterprise': {
    userMessage = 'an enterprise user!';
    break;
  }
  default: {
    const exhaust: never = props.type;
    return exhaust;
 }
}
%>
Hello <%= props.name %>, you are <%= userMessage %>
