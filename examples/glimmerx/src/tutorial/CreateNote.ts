import Component, { hbs } from '@glimmerx/component';
import { on } from '@glimmerx/modifier';
import { useMutation } from 'glimmer-apollo';
import {
  CREATE_NOTE,
  CreateNoteMutation,
  CreateNoteMutationVariables
} from './mutations';
import { GET_NOTES, GetNotesQuery, GetNotesQueryVariables } from './queries';

export default class CreateNote extends Component {
  createNote = useMutation<CreateNoteMutation, CreateNoteMutationVariables>(
    this,
    () => [
      CREATE_NOTE,
      {
        update(cache, result): void {
          const variables = { isArchived: false };

          const data = cache.readQuery<GetNotesQuery, GetNotesQueryVariables>({
            query: GET_NOTES,
            variables
          });

          if (data) {
            const existingNotes = data.notes;
            const newNote = result.data?.createNote;

            if (newNote) {
              cache.writeQuery({
                query: GET_NOTES,
                variables,
                data: { notes: [newNote, ...existingNotes] }
              });
            }
          }
        }
      }
    ]
  );

  submit = async (): Promise<void> => {
    await this.createNote.mutate({
      input: {
        title: 'Title',
        description: 'Description',
        isArchived: false
      }
    });
  };

  static template = hbs`
    <button {{on "click" this.submit}}>
      Create Note
    </button>

    {{#if this.createNote.loading}}
      Creating...
    {{else if this.createNote.error}}
      Error!:
      {{this.createNote.error.message}}
    {{else if this.createNote.called}}
      <div>
        id:
        {{this.createNote.data.createNote.id}}
        Title:
        {{this.createNote.data.createNote.title}}
        Description:
        {{this.createNote.data.createNote.description}}
      </div>
    {{/if}}
  `;
}
