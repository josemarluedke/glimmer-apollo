import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { on } from '@ember/modifier';
import { service } from '@ember/service';
import { DocfyLink } from '@docfy/ember';
import type { DocfyService } from '@docfy/ember';

interface Signature {
  Args: {
    darkOnly?: boolean;
  };
  Element: HTMLButtonElement;
}

export default class DocfyJumpTo extends Component<Signature> {
  @service declare docfy: DocfyService;
  @tracked isOpen = false;
  @tracked query = '';
  @tracked selected = 0;

  get results() {
    if (!this.query) return [];

    const allPages = this.docfy.flat;
    const lowerQuery = this.query.toLowerCase();

    return allPages
      .filter((page) =>
        page.title.toLowerCase().includes(lowerQuery) ||
        (page.headings || []).some((h) => h.title.toLowerCase().includes(lowerQuery))
      )
      .slice(0, 10);
  }

  get buttonClass() {
    if (this.args.darkOnly) {
      return 'flex items-center px-3 py-2 text-slate-400 hover:text-white';
    }
    return 'flex items-center px-3 py-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200';
  }

  get badgeClass() {
    if (this.args.darkOnly) {
      return 'hidden sm:block ml-3 rounded border border-slate-600 px-2 py-1 text-xs';
    }
    return 'hidden sm:block ml-3 rounded border border-slate-300 dark:border-slate-600 px-2 py-1 text-xs';
  }

  @action toggle() {
    this.isOpen = !this.isOpen;
    if (!this.isOpen) {
      this.query = '';
      this.selected = 0;
    }
  }

  @action search(event: Event) {
    const target = event.target as HTMLInputElement;
    this.query = target.value;
    this.selected = 0;
  }

  @action onItemClick() {
    this.toggle();
  }

  @action stopPropagation(event: Event) {
    event.stopPropagation();
  }

  <template>
    <button
      type="button"
      class={{this.buttonClass}}
      {{on "click" this.toggle}}
      ...attributes
    >
      <svg
        class="w-4 h-4 mr-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      Search
      <code class={{this.badgeClass}}>
        /
      </code>
    </button>

    {{#if this.isOpen}}
      <div
        class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur select-none"
        {{on "click" this.toggle}}
        role="button"
      >
        <div
          class="p-4 mx-auto mt-24 max-w-lg w-full"
          {{on "click" this.stopPropagation}}
          role="dialog"
        >
          <div class="bg-slate-800 rounded-lg shadow-xl border border-slate-700 overflow-hidden">
            <input
              type="text"
              autocomplete="off"
              autofocus
              placeholder="Search..."
              class="p-4 bg-slate-900 text-slate-100 placeholder-slate-500 w-full focus:outline-none border-b border-slate-700"
              value={{this.query}}
              {{on "input" this.search}}
            />

            <div class="max-h-96 overflow-y-auto">
              {{#each this.results as |page index|}}
                <DocfyLink
                  @to={{page.url}}
                  class="flex items-center p-4 text-slate-100 hover:bg-slate-700
                    {{if (eq this.selected index) 'bg-slate-700'}}"
                  {{on "click" this.onItemClick}}
                >
                  {{page.title}}
                </DocfyLink>
              {{/each}}

              {{#unless this.results.length}}
                {{#if this.query}}
                  <div class="p-4 text-slate-500 text-center">
                    No results found
                  </div>
                {{/if}}
              {{/unless}}
            </div>
          </div>
        </div>
      </div>
    {{/if}}
  </template>
}

function eq(a: number, b: number): boolean {
  return a === b;
}
