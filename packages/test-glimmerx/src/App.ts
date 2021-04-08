import Component, { hbs } from '@glimmerx/component';
import { useQuery } from 'glimmer-apollo';
import { gql } from '@apollo/client/core';
import './App.css';

export default class App extends Component<{}> {
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
    <div class="btn"></div>
    div
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
