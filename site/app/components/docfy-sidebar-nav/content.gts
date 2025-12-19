import Component from '@glimmer/component';
import { on } from '@ember/modifier';
import { DocfyLink } from '@docfy/ember';

interface Page {
  url: string;
  title: string;
}

interface NestedNode {
  label?: string;
  pages: Page[];
  children: NestedNode[];
}

interface Signature {
  Args: {
    node: NestedNode;
    onSidebarClick: (event: Event) => void;
  };
  Element: HTMLDivElement;
}

export default class DocfySidebarNavContent extends Component<Signature> {
  <template>
    {{! template-lint-disable no-invalid-interactive }}
    <div {{on "click" @onSidebarClick}} ...attributes>
      <ul class="space-y-2">
        {{#each @node.pages as |page|}}
          <li>
            <DocfyLink
              @to={{page.url}}
              class="transition pl-2 py-1 hover:text-pink-800 dark:hover:text-pink-100 text-sm block rounded hover:bg-pink-100 dark:hover:bg-pink-900 outline-none focus-visible:ring ring-inset"
              @activeClass="text-pink-800 dark:text-pink-100 bg-pink-100 dark:bg-pink-900"
            >
              {{page.title}}
            </DocfyLink>
          </li>
        {{/each}}

        {{#each @node.children as |child|}}
          <li>
            <div
              class="pt-2 pl-2 pb-2 text-xs text-pink-700 dark:text-pink-300"
            >
              {{child.label}}
            </div>

            <ul class="space-y-2">
              {{#each child.pages as |page|}}
                <li class="truncate">
                  <DocfyLink
                    @to={{page.url}}
                    class="transition pl-6 py-1 hover:text-pink-800 dark:hover:text-pink-100 text-sm block rounded hover:bg-pink-100 dark:hover:bg-pink-900 outline-none focus-visible:ring ring-inset"
                    @activeClass="text-pink-800 dark:text-pink-100 bg-pink-100 dark:bg-pink-900"
                  >
                    {{page.title}}
                  </DocfyLink>
                </li>
              {{/each}}

              {{#each child.children as |subChild|}}
                <li>
                  <div
                    class="pl-6 pt-2 pb-2 text-xs text-pink-700 dark:text-pink-300"
                  >
                    {{subChild.label}}
                  </div>

                  <ul class="space-y-2">
                    {{#each subChild.pages as |page|}}
                      <li class="truncate">
                        <DocfyLink
                          @to={{page.url}}
                          class="transition pl-10 py-1 hover:text-pink-800 dark:hover:text-pink-100 text-sm block rounded hover:bg-pink-100 dark:hover:bg-pink-900 outline-none focus-visible:ring ring-inset"
                          @activeClass="text-pink-800 dark:text-pink-100 bg-pink-100 dark:bg-pink-900"
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
    </div>
  </template>
}
