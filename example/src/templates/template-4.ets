---
import { uppercase } from './helpers';

export interface Props {
  name: string;
}
---
Hello <%= uppercase(props.name) %>!
