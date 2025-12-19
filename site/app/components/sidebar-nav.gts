import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { on } from '@ember/modifier';
import { DocfyLink } from '@docfy/ember';
import VisuallyHidden from './visually-hidden';

interface Page {
  url: string;
  title: string;
}

interface NestedNode {
  label?: string;
  name?: string;
  pages: Page[];
  children: NestedNode[];
}

interface Signature {
  Args: {
    node: NestedNode;
  };
  Element: HTMLDivElement;
}

export default class SidebarNav extends Component<Signature> {
  @tracked isOpen = false;

  @action toggle(): void {
    this.isOpen = !this.isOpen;
  }

  @action handleSidebarClick(event: Event): void {
    if (this.isOpen) {
      const target = event.target as HTMLElement;
      if (target.tagName === 'A') {
        this.toggle();
      }
    }
  }

  @action stopPropagation(event: Event): void {
    event.stopPropagation();
  }

  <template>
    <div ...attributes>
      {{! Mobile toggle button - fixed bottom right }}
      <button
        type="button"
        class="fixed z-40 bottom-4 right-4 flex items-center p-4 border rounded-full lg:hidden bg-slate-900/80 backdrop-blur text-white border-slate-700 focus:outline-none focus-visible:ring"
        {{on "click" this.toggle}}
      >
        <VisuallyHidden>Contents</VisuallyHidden>
        <svg class="w-8" fill="currentColor" viewBox="0 0 20 20">
          <path
            d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
            clip-rule="evenodd"
            fill-rule="evenodd"
          ></path>
        </svg>
      </button>

      {{! Mobile drawer }}
      {{#if this.isOpen}}
        <div
          class="fixed inset-0 z-50 lg:hidden"
          {{on "click" this.toggle}}
        >
          {{! Backdrop }}
          <div class="absolute inset-0 bg-slate-900/50 backdrop-blur"></div>

          {{! Drawer panel }}
          <div
            class="absolute top-0 right-0 bottom-0 w-80 max-w-full bg-slate-900/95 backdrop-blur border-l border-slate-700 flex flex-col"
            {{on "click" this.stopPropagation}}
          >
            {{! Header }}
            <div class="flex items-center justify-between p-4 border-b border-slate-700">
              <span class="text-white font-semibold">Contents</span>
              <button
                type="button"
                class="p-2 text-slate-400 hover:text-white focus:outline-none"
                {{on "click" this.toggle}}
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {{! Navigation content }}
            <div
              class="flex-1 overflow-y-auto p-4"
              {{on "click" this.handleSidebarClick}}
            >
              <nav class="font-light space-y-3 text-slate-100">
                <ul class="space-y-3">
                  {{#each @node.pages as |page|}}
                    <li>
                      <DocfyLink
                        @to={{page.url}}
                        class="hover:text-pink-400"
                        @activeClass="font-semibold text-pink-400"
                      >
                        {{page.title}}
                      </DocfyLink>
                    </li>
                  {{/each}}

                  {{#each @node.children as |child|}}
                    <li>
                      <div class="pb-2 font-semibold text-pink-500">
                        {{child.label}}
                      </div>

                      <ul class="pl-4 border-l border-slate-600 space-y-3">
                        {{#each child.pages as |page|}}
                          <li class="truncate">
                            <DocfyLink
                              @to={{page.url}}
                              class="hover:text-pink-400"
                              @activeClass="font-semibold text-pink-400 bg-pink-900/50 -ml-4 pl-4 -mr-4 pr-4 py-1 block border-l-2 border-pink-500"
                            >
                              {{page.title}}
                            </DocfyLink>
                          </li>
                        {{/each}}

                        {{#each child.children as |subChild|}}
                          <li>
                            <div class="pb-2 font-medium">
                              {{subChild.label}}
                            </div>

                            <ul class="pl-4 border-l border-slate-600 space-y-3">
                              {{#each subChild.pages as |page|}}
                                <li class="truncate">
                                  <DocfyLink
                                    @to={{page.url}}
                                    class="hover:text-pink-400"
                                    @activeClass="font-semibold text-pink-400"
                                  >
                                    {{page.title}}
                                  </DocfyLink>
                                </li>
                              {{/each}}
                            </ul>
                          </li>
                        {{/each}}
                      </ul>
                    </li>
                  {{/each}}
                </ul>
              </nav>
            </div>
          </div>
        </div>
      {{/if}}

      {{! Desktop sidebar }}
      <div
        class="hidden lg:block lg:overflow-y-auto lg:sticky top-16 lg:max-h-[calc(100vh-4rem)] pt-12 pb-4 -mt-12"
      >
        <nav class="font-light space-y-3">
          <ul class="space-y-3">
            {{#each @node.pages as |page|}}
              <li>
                <DocfyLink
                  @to={{page.url}}
                  class="hover:text-pink-600 dark:hover:text-pink-400"
                  @activeClass="font-semibold text-pink-600 dark:text-pink-400"
                >
                  {{page.title}}
                </DocfyLink>
              </li>
            {{/each}}

            {{#each @node.children as |child|}}
              <li>
                <div class="pb-2 font-semibold text-pink-600 dark:text-pink-500">
                  {{child.label}}
                </div>

                <ul class="pl-4 border-l border-gray-300 dark:border-gray-700 space-y-3">
                  {{#each child.pages as |page|}}
                    <li class="truncate">
                      <DocfyLink
                        @to={{page.url}}
                        class="hover:text-pink-600 dark:hover:text-pink-400"
                        @activeClass="font-semibold text-pink-600 dark:text-pink-400"
                      >
                        {{page.title}}
                      </DocfyLink>
                    </li>
                  {{/each}}

                  {{#each child.children as |subChild|}}
                    <li>
                      <div class="pb-2 font-medium">
                        {{subChild.label}}
                      </div>

                      <ul class="pl-4 border-l border-gray-300 dark:border-gray-700 space-y-3">
                        {{#each subChild.pages as |page|}}
                          <li class="truncate">
                            <DocfyLink
                              @to={{page.url}}
                              class="hover:text-pink-600 dark:hover:text-pink-400"
                              @activeClass="font-semibold text-pink-600 dark:text-pink-400"
                            >
                              {{page.title}}
                            </DocfyLink>
                          </li>
                        {{/each}}
                      </ul>
                    </li>
                  {{/each}}
                </ul>
              </li>
            {{/each}}
          </ul>
        </nav>
      </div>
    </div>
  </template>
}
