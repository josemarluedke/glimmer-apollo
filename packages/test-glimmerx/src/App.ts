import Component, { hbs } from '@glimmerx/component';
import { useQuery } from 'glimmer-apollo';
import { gql } from '@apollo/client/core';
import './App.css';

export default class App extends Component<{}> {
  static template = hbs`
    <div class="max-w-screen-lg mx-auto px-6 flex flex-col min-h-screen">
      <h1 class="text-3xl font-bold py-4 text-center">Notes</h1>
      <Notes class="flex-grow mb-10" />
    </div>
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
    <div class="flex rounded bg-gray-900" ...attributes>
      <div class="w-1/3 p-4 flex flex-col space-y-2 divide-y divide-gray-800">

        {{#if this.notes.loading}}

          <div class="h-10 bg-gray-800 rounded"></div>
          <div class="h-10 bg-gray-800 rounded"></div>
          <div class="h-10 bg-gray-800 rounded"></div>

        {{else}}
          {{#each this.notes.data.notes as |note|}}
            <button
              type="button"
              class="text-left p-2 hover:bg-gray-800 rounded"
            >
               {{note.title}}
            </button>
          {{/each}}
        {{/if}}
      </div>

      <div class="w-2/3 border-l-2 border-black p-4">
        Content
    Loading: {{this.notes.loading}}
    <br />
    Error: {{this.notes.error}}
    Data:
    {{#each this.notes.data.notes as |note|}}
      <div>
        title: {{note.title}}
      </div>
    {{/each}}
      </div>
    </div>

  `;
}
