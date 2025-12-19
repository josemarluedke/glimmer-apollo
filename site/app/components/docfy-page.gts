import Component from '@glimmer/component';
import { service } from '@ember/service';
import { cached } from '@glimmer/tracking';
import { DocfyLink } from '@docfy/ember';
import SidebarNav from './sidebar-nav';
import type { DocfyService } from '@docfy/ember';
import type RouterService from '@ember/routing/router-service';

interface Signature {
  Args: {
    scope?: string;
  };
  Blocks: {
    default: [];
  };
  Element: HTMLDivElement;
}

export default class DocfyPage extends Component<Signature> {
  @service declare docfy: DocfyService;
  @service declare router: RouterService;

  @cached
  get currentPage() {
    const currentURL = this.router.currentURL;
    return currentURL ? this.docfy.findByUrl(currentURL) : undefined;
  }

  @cached
  get nested() {
    if (this.args.scope) {
      return this.docfy.nested.children.find(
        (child) => child.name === this.args.scope
      );
    }
    return this.docfy.nested;
  }

  <template>
    <div
      class="px-4 mx-auto lg:px-6 max-w-7xl"
      data-test-id="docfy-page"
      ...attributes
    >
      <div class="relative lg:flex">
        <div class="flex-none pt-12 pr-4 lg:w-64" data-test-id="sidebar-nav">
          {{#if this.nested}}
            <SidebarNav @node={{this.nested}} />
          {{/if}}
        </div>

        <div
          class="flex-1 w-full min-w-0 px-0 pt-12 lg:px-4"
          data-test-id="main-content"
        >
          <div class="markdown max-w-none" data-test-id="markdown-content">
            {{yield}}
          </div>

          {{#if this.currentPage.editUrl}}
            <div class="flex justify-between mt-10">
              <a
                href={{this.currentPage.editUrl}}
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                data-test-id="edit-page-link"
              >
                <svg class="w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
                  ></path>
                </svg>
                Edit this page on GitHub
              </a>
            </div>
          {{/if}}
        </div>
      </div>
    </div>
  </template>
}
