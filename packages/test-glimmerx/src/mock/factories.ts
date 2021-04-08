import { Factory } from 'miragejs';

const note = Factory.extend({
  title: (i: number) => `Note ${i}`,
  description: 'Description'
});

export default { note };
