import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { on } from '@ember/modifier';
import { service } from '@ember/service';
import { DocfyLink } from '@docfy/ember';
import type { DocfyService } from '@docfy/ember';
import type RouterService from '@ember/routing/router-service';
import { Overlay } from '@frontile/overlays';
import VisuallyHidden from './visually-hidden';
import { modifier } from 'ember-modifier';

interface Signature {
  Element: HTMLButtonElement;
}

const didInsert = modifier((element: HTMLElement, [callback]: [() => void]) => {
  callback();
});

const willDestroy = modifier((element: HTMLElement, [callback]: [() => void]) => {
  return () => callback();
});

function eq(a: unknown, b: unknown): boolean {
  return a === b;
}

export default class DocfyJumpTo extends Component<Signature> {
  @service declare docfy: DocfyService;
  @service declare router: RouterService;

  @tracked isOpen = false;
  @tracked pattern = '';
  @tracked results: Array<{ url: string; title: string; parentLabel?: string }> = [];
  @tracked selected?: number;
  resultsContainerElement?: HTMLElement;

  get allPages() {
    return this.docfy.flat;
  }

  selectNext(): void {
    if (!this.results.length) {
      return;
    }

    if (typeof this.selected !== 'undefined') {
      if (this.selected + 1 < this.results.length) {
        this.selected += 1;
      }
    } else {
      this.selected = 0;
    }
  }

  selectPrevious(): void {
    if (!this.results.length) {
      return;
    }

    if (typeof this.selected !== 'undefined') {
      if (this.selected - 1 >= 0) {
        this.selected -= 1;
      }
    }
  }

  @action setupShortcut(): void {
    document.addEventListener('keydown', this.handleGlobalKeyDown);
  }

  @action teardownShortcut(): void {
    document.removeEventListener('keydown', this.handleGlobalKeyDown);
  }

  handleGlobalKeyDown = (event: KeyboardEvent): void => {
    if (
      !['INPUT', 'TEXTAREA'].includes((event.target as HTMLElement).tagName)
    ) {
      if (event.key === '/') {
        event.preventDefault();
        this.isOpen = true;
      }
    }
  };

  @action registerContainerElement(element: HTMLElement): void {
    this.resultsContainerElement = element;
  }

  @action search(event: Event): void {
    const pattern = (event.target as HTMLInputElement).value.toLowerCase();
    this.pattern = pattern;

    if (!pattern) {
      this.results = [];
      this.selected = undefined;
      return;
    }

    this.results = this.allPages
      .filter((page) => {
        const titleMatch = page.title.toLowerCase().includes(pattern);
        const labelMatch = page.parentLabel?.toLowerCase().includes(pattern);
        return titleMatch || labelMatch;
      })
      .slice(0, 10)
      .map((page) => ({
        url: page.url,
        title: page.title,
        parentLabel: page.parentLabel
      }));

    this.selected = undefined;
    this.selectNext();
  }

  @action toggle(): void {
    this.isOpen = !this.isOpen;
  }

  @action didClose(): void {
    this.results = [];
    this.pattern = '';
    this.selected = undefined;
  }

  @action onItemClick(event: MouseEvent): void {
    event.preventDefault();

    const target = event.target as HTMLElement;
    let element: HTMLElement | null = target;

    if (['svg', 'span', 'path'].includes(target.tagName.toLowerCase())) {
      element = target.closest('a');
    }

    this.isOpen = false;
    const href = element?.getAttribute('href') || '/';
    this.router.transitionTo(href);
  }

  @action selectElement(event: MouseEvent): void {
    const index = Number(
      (event.target as HTMLElement).getAttribute('data-result')
    );
    if (!isNaN(index)) {
      this.selected = index;
    }
  }

  @action onInputKeyDown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown') {
      this.selectNext();
      event.preventDefault();
    } else if (event.key === 'ArrowUp') {
      this.selectPrevious();
      event.preventDefault();
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (this.resultsContainerElement && typeof this.selected !== 'undefined') {
        const link = this.resultsContainerElement.querySelector(
          `[data-result="${this.selected}"]`
        ) as HTMLElement | undefined;
        if (link) {
          link.click();
        }
      }
    }
  }

  <template>
    <button
      type="button"
      class="transition flex items-center rounded focus-visible:ring outline-none hover:text-gray-800 dark:hover:text-gray-400"
      {{on "click" this.toggle}}
      {{didInsert this.setupShortcut}}
      {{willDestroy this.teardownShortcut}}
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
      <code
        class="hidden sm:block ml-3 rounded border font-bold border-gray-300 dark:border-gray-600 px-2 py-1 text-xs leading-none"
      >
        /
      </code>
    </button>

    <Overlay
      @isOpen={{this.isOpen}}
      @onClose={{this.toggle}}
      @didClose={{this.didClose}}
    >
      <div
        class="p-4 mx-auto text-white mt-20 max-w-md w-full"
        {{didInsert this.registerContainerElement}}
      >
        <div
          class="bg-gray-900 backdrop-blur bg-opacity-80 rounded overflow-hidden border border-gray-700"
        >
          <VisuallyHidden>
            <label for="docfy-jump-to-input">
              Search
            </label>
          </VisuallyHidden>
          <input
            id="docfy-jump-to-input"
            autocomplete="off"
            placeholder="Search..."
            class="p-4 bg-transparent w-full focus:outline-none placeholder-gray-500
              {{if this.results.length 'border-b border-gray-700'}}"
            {{on "input" this.search}}
            {{on "keydown" this.onInputKeyDown}}
          />

          <div class="space-y-2 max-h-96 overflow-y-auto">
            {{#each this.results as |result index|}}
              <DocfyLink
                @to={{result.url}}
                class="flex items-center p-4 outline-none focus-visible:ring ring-inset
                  {{if (eq this.selected index) 'bg-gray-700 text-white'}}"
                data-result={{index}}
                {{on "click" this.onItemClick}}
                {{on "mouseenter" this.selectElement}}
              >
                {{#if result.parentLabel}}
                  <span class="font-bold">
                    {{result.parentLabel}}
                  </span>

                  <svg
                    class="w-4 h-4 mx-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                {{/if}}

                <span class="text-gray-300">
                  {{result.title}}
                </span>
              </DocfyLink>
            {{/each}}
          </div>
        </div>
      </div>
    </Overlay>
  </template>
}
