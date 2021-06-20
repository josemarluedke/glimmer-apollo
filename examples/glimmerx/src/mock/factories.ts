import { Factory } from 'miragejs';

const note = Factory.extend({
  title: (i: number) => `Note ${i}`,
  description: 'Description',
  isArchived: (i: number) => !(i % 2)
});

export default { note };
