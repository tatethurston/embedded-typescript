---
export interface Props {
  name: string;
  email: string;
  phone: string;
}
---
Name: <%= props.name %>
Email: <%= props.email %>
Phone: <%= props.phone %>
