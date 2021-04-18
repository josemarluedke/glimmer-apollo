import Component, { hbs, tracked } from '@glimmerx/component';
import { on } from '@glimmerx/modifier';
import { fn } from '@glimmerx/helper';
import { useQuery } from 'glimmer-apollo';
import { gql } from '@apollo/client/core';
import { WriteIcon } from './Icons';

function equal(a: unknown, b: unknown): boolean {
  return a === b;
}

const Divider = hbs`
  <div class="bg-gray-800 h-px m-2 last:m-0 last:h-0"></div>
`;

const Placeholder = hbs`
  <div class="h-10 bg-gray-800 rounded"></div>
  <Divider />
`;

const NoteButton = hbs`
  <button
    type="button"
    class="text-left p-2 rounded focus:outline-none focus:ring ring-green-400 {{if (equal @note.id @selectedNote.id) "bg-gray-700" "hover:bg-gray-800"}}"
    {{on "click" (fn @onSelectNote @note)}}
  >
    {{@note.title}}
  </button>
  <Divider />
`;

const ContentPanelHeader = hbs`
  <div class="border-b border-black pb-2 mb-2 text-right">
    <button type="button" class="p-2 rounded hover:bg-gray-800 focus:outline-none focus:ring ring-green-400">
      <WriteIcon class="w-6 h-6" />
    </button>
  </div>
`;

export default class Notes extends Component {
  @tracked selectedNote: any;

  notes = useQuery(this, () => [
    gql`
      query {
        notes {
          id
          title
          description
        }
      }
    `,
    {
      onComplete: (): void => {
        this.selectedNote = undefined;
      }
    }
  ]);

  selectNote = (note): void => {
    this.selectedNote = note;
  };

  static template = hbs`
    <div class="flex flex-col sm:flex-row rounded bg-gray-900" ...attributes>
      <div class="sm:w-1/3 p-4 flex flex-col">
        {{#if this.notes.loading}}
          <Placeholder />
          <Placeholder />
          <Placeholder />
        {{else}}
          {{#each this.notes.data.notes as |note|}}
            <NoteButton
              @note={{note}}
              @onSelectNote={{this.selectNote}}
              @selectedNote={{this.selectedNote}}
            />
          {{/each}}
        {{/if}}
      </div>

      <div class="sm:w-2/3 border-t-2 sm:border-t-0 sm:border-l-2 border-black p-4">
        <ContentPanelHeader />
        {{this.selectedNote.description}}
      </div>
    </div>
  `;
}
