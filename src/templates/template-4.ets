<% import { uppercase } from './helpers'; %>

<% export function render(name: string): string { %>
Hello <%= uppercase(name) %>!
<% } %>
