/*
 * THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.
 *
 * Run `npx ets` or `yarn ets` to regenerate this file.
 * Source: ./template-1.ets
 */
/* eslint-disable */

export interface Props {
  users: { name: string }[];
}

export default function (props: Props): string {
  let result = "";
  props.users.forEach(function (user) {
    result += "Name: ";
    result += user.name;
    result += "\n";
  });
  return result;
}