import { uppercase } from './helpers';

export const render = (name: string): string => <%>
Hello <%= uppercase(name) %>!
<%>
