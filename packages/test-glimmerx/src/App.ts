import Component, { hbs } from '@glimmerx/component';
import createApollo from './apollo';
import { useQuery } from 'glimmer-apollo';
import { gql } from '@apollo/client/core';
import './App.css';
import { startServer } from './mock/server';

export default class App extends Component<{}> {
  constructor(owner: object, args: {}) {
    super(owner, args);
    const server = startServer('development');
    server.createList('note', 3);
    createApollo();
  }

  static template = hbs`
    <h1>Notes</h1>
    <Notes />
  `;
}

export class Notes extends Component {
  notes = useQuery(this, () => [
    gql`
      query {
        notes {
          id
          title
          description
        }
      }
    `
  ]);

  static template = hbs`
    Loading: {{this.notes.loading}}
    <br />
    Error: {{this.notes.error}}
    Data:
    {{#each this.notes.data.notes as |note|}}
      <div>
        title: {{note.title}}
      </div>
    {{/each}}
  `;
}
