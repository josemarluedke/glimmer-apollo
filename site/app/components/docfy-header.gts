import Component from '@glimmer/component';
import { LinkTo } from '@ember/routing';

interface Signature {
  Args: {
    name?: string;
    darkOnly?: boolean;
    githubUrl?: string;
  };
  Blocks: {
    title: [];
    left: [];
    right: [linkClass: string, linkClassActive: string];
  };
  Element: HTMLElement;
}

export default class DocfyHeader extends Component<Signature> {
  get headerClass() {
    const base = 'sticky top-0 z-50 flex items-center justify-between px-4 py-3 border-b';
    if (this.args.darkOnly) {
      // When darkOnly, use slate (blue-gray) colors directly
      return `${base} bg-slate-800 text-slate-100 border-slate-700`;
    }
    return `${base} bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700`;
  }

  get linkClass() {
    if (this.args.darkOnly) {
      return 'px-3 py-2 rounded text-slate-300 hover:bg-slate-700 hover:text-white';
    }
    return 'px-3 py-2 rounded text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white';
  }

  get linkClassActive() {
    if (this.args.darkOnly) {
      return 'text-pink-400';
    }
    return 'text-pink-600 dark:text-pink-400';
  }

  get iconClass() {
    if (this.args.darkOnly) {
      return 'text-slate-400 hover:text-white';
    }
    return 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white';
  }

  <template>
    <header
      class={{this.headerClass}}
      ...attributes
    >
      <div class="flex items-center space-x-4">
        <LinkTo @route="index" class="flex items-center">
          {{yield to="title"}}
        </LinkTo>
        {{yield to="left"}}
      </div>

      <div class="flex items-center space-x-4">
        {{yield this.linkClass this.linkClassActive to="right"}}

        {{#if @githubUrl}}
          <a
            href={{@githubUrl}}
            target="_blank"
            rel="noopener noreferrer"
            class={{this.iconClass}}
          >
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
          </a>
        {{/if}}
      </div>
    </header>
  </template>
}
