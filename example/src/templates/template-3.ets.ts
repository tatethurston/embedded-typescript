// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.
// Source: ./template-3.ets

type AccountType = 'user' | 'admin' | 'enterprise';

interface Account {
  name: string;
  type: AccountType;
}

export const render = ({ name, type}: Account): string => (() => {
  let result = '';
  result += 'Hello ';
  result +=  name;
  result += ', you are ';
  switch (type) {
  case 'user': {
  result += 'a user!\n';
  break; }
  case 'admin': {
  result += 'an admin!\n';
  break; }
  case 'enterprise': {
  result += 'an enterprise user!\n';
  break; }
  default: {
    const exhaust: never = type;
    return exhaust;
   }
  }
  return result;
  })()
