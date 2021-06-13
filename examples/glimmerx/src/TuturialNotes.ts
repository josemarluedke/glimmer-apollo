import Component, { hbs } from '@glimmerx/component';
import { on } from '@glimmerx/modifier';
import { tracked } from '@glimmer/tracking';
import { useQuery } from 'glimmer-apollo';
import { GET_NOTES } from './queries';

export default class Notes extends Component {
  @tracked isArchived = false;

  notes = useQuery(this, () => [
    GET_NOTES,
    {
      variables: { isArchived: this.isArchived },
      onComplete: (data): void => {
        console.log('Received data: ', data);
      },
      onError: (error): void => {
        console.error('Received an error', error.message);
      }
    }
  ]);

  toggleIsArchived = (): void => {
    this.isArchived = !this.isArchived;
  };

  static template = hbs`
    <button {{on "click" this.toggleIsArchived}}>
      {{#if this.isArchived}}
        Show not archived
      {{else}}
        Show archived
      {{/if}}
    </button>

    <button {{on "click" this.notes.refetch}}>Refech</button>

    {{#if this.notes.loading}}
      Loading...
    {{else if this.notes.error}}
      Error!: {{this.notes.error.message}}
    {{else}}
      {{#each this.notes.data.notes as |note|}}
        <div>
          Title: {{note.title}}
          Description: {{note.description}}
        </div>
      {{/each}}
    {{/if}}
  `;
}
