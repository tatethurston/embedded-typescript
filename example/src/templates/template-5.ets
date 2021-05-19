type AccountType = 'user' | 'admin' | 'enterprise';

interface Account {
  name: string;
  type: AccountType;
}

export const render = ({ name, type}: Account): string => {
  let userMessage;
  switch (type) {
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
      const exhaust: never = type;
      return exhaust;
   }
  }

  return <%>
Hello <%= name %>, you are <%= userMessage %>
  <%>
}
