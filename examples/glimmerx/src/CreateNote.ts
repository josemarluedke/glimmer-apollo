import Component, { hbs } from '@glimmerx/component';
import { on } from '@glimmerx/modifier';
import { useMutation } from 'glimmer-apollo';
import { CREATE_NOTE } from './mutations';

export default class CreateNote extends Component {
  createNote = useMutation(this, () => [
    CREATE_NOTE,
    {
      variables: {
        // default variables here
      },
      errorPolicy: 'all'
    }
  ]);

  submit = async (): Promise<void> => {
    await this.createNote.mutate(
      {
        // overwrite default variables here
      },
      { refetchQueries: ['GetNotes'] }
    );
  };

  static template = hbs`
    <button {{on "click" this.submit}}>
      Create Note
    </button>

    {{#if this.createNote.loading}}
      Creating...
    {{else if this.createNote.error}}
      Error!: {{this.createNote.error.message}}
    {{else if this.createNote.called}}
      <div>
        id: {{this.createNote.data.createNote.id}}
        Title: {{this.createNote.data.createNote.title}}
        Description: {{this.createNote.data.createNote.description}}
      </div>
    {{/if}}
  `;
}
