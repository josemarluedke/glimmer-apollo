import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { DocfyOutput } from '@docfy/ember';
import { pageTitle } from 'ember-page-title';
import DocfySidebarNav from './docfy-sidebar-nav';
import DocfyPageHeadings from './docfy-page-headings';
import docfyIntersectHeadings from '../modifiers/docfy-intersect-headings';

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
  @tracked currentHeadingId?: string;

  setCurrentHeadingId = (id: string): void => {
    this.currentHeadingId = id;
  };

  <template>
    <div class="px-4 mx-auto lg:px-6 max-w-screen-2xl pb-16" ...attributes>
      <DocfyOutput @fromCurrentURL={{true}} as |page|>
        {{pageTitle "Documentation"}}
        {{pageTitle page.title}}
      </DocfyOutput>

      <div class="relative lg:flex">
        <div class="flex-none pr-4 lg:w-64">
          <DocfyOutput @scope={{@scope}} as |node|>
            <DocfySidebarNav @node={{node}} />
          </DocfyOutput>
        </div>

        <div class="flex-1 w-full min-w-0 px-0 pt-12 lg:px-10">
          <DocfyOutput @fromCurrentURL={{true}} as |page|>
            <div
              class="markdown max-w-none"
              {{docfyIntersectHeadings
                headings=page.headings
                onIntersect=this.setCurrentHeadingId
              }}
            >
              {{yield}}
            </div>
          </DocfyOutput>

          <div class="flex justify-between mt-10">
            <DocfyOutput @fromCurrentURL={{true}} as |page|>
              {{#if page.editUrl}}
                <a
                  href={{page.editUrl}}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center text-xs hover:text-pink-700 dark:hover:text-pink-400"
                >
                  <svg class="w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
                    ></path>
                  </svg>
                  Edit this page on GitHub
                </a>
              {{/if}}
            </DocfyOutput>
          </div>
        </div>

        <div class="flex-none hidden w-56 pl-4 lg:block">
          <DocfyPageHeadings @currentHeadingId={{this.currentHeadingId}} />
        </div>
      </div>
    </div>
  </template>
}
