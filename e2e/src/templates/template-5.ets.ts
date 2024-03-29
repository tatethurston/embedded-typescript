/*
 * THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.
 *
 * Run `npx ets` or `yarn ets` to regenerate this file.
 * Source: ./template-5.ets
 */
/* eslint-disable */

type AccountType = "user" | "admin" | "enterprise";

export interface Props {
  name: string;
  type: AccountType;
}

export default function (props: Props): string {
  let result = "";
  let userMessage;
  switch (props.type) {
    case "user": {
      userMessage = "a user!";
      break;
    }
    case "admin": {
      userMessage = "an admin!";
      break;
    }
    case "enterprise": {
      userMessage = "an enterprise user!";
      break;
    }
    default: {
      const exhaust: never = props.type;
      return exhaust;
    }
  }
  result += "Hello ";
  result += props.name;
  result += ", you are ";
  result += userMessage;
  return result;
}
