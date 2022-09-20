---
import renderUser, { Props as User } from './user-partial.ets';

export interface Props {
  users: User[];
}

const example = 
`1
2
3
4`;
---
<% if (props.users.length > 0) { %>
Here is a list of users:
  <% props.users.forEach(function(user) { %>

  <%= renderUser(user) %>
  <% }) %>

<% } %>
The indentation level is preserved for the rendered 'partial'.

There isn't anything special about the 'partial'. Here we used another ets template, but any
expression yeilding a multiline string would be treated the same.

  <%= example %>

The end!
