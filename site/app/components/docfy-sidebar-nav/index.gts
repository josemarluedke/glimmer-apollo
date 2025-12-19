import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { on } from '@ember/modifier';
import { Drawer } from '@frontile/overlays';
import VisuallyHidden from '../visually-hidden';
import DocfySidebarNavContent from './content';

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
  };
  Element: HTMLDivElement;
}

export default class DocfySidebarNav extends Component<Signature> {
  @tracked isOpen = false;

  @action toggle(): void {
    this.isOpen = !this.isOpen;
  }

  @action handleSidebarClick(event: Event): void {
    if (this.isOpen) {
      const target = event.target as Element;

      if (['A', 'svg', 'path'].includes(target.tagName)) {
        let parentElement: Element | undefined = target;

        if (target.tagName == 'path') {
          parentElement = target.parentElement?.closest('svg')
            ?.parentElement as Element;
        } else if (target.tagName == 'svg') {
          parentElement = target.parentElement as Element;
        }

        if (
          parentElement &&
          parentElement.hasAttribute('data-ignore-auto-close')
        ) {
          return;
        }

        this.toggle();
      }
    }
  }

  <template>
    <div ...attributes>
      <button
        type="button"
        class="fixed z-10 bottom-4 right-4 flex items-center p-4 border rounded-full lg:hidden bg-gray-900 backdrop-blur bg-opacity-70 text-white border-gray-700 focus-visible:ring outline-none"
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

      <Drawer
        @isOpen={{this.isOpen}}
        @onClose={{this.toggle}}
        @size="xs"
        @allowCloseButton={{false}}
        class="bg-gray-900 backdrop-blur bg-opacity-80 dark border-l border-gray-700 outline-none focus-visible:ring ring-inset"
        as |m|
      >
        <m.CloseButton
          class="dark:text-white hover:bg-gray-800 outline-none focus-visible:ring"
        />
        <m.Header class="border-b border-gray-700 dark:text-white">
          Contents
        </m.Header>
        <m.Body class="dark:text-white">
          <DocfySidebarNavContent
            @node={{@node}}
            @onSidebarClick={{this.handleSidebarClick}}
          />
        </m.Body>
      </Drawer>

      <DocfySidebarNavContent
        @node={{@node}}
        @onSidebarClick={{this.handleSidebarClick}}
        class="lg:overflow-y-auto lg:sticky top-16 lg:max-h-[calc(100vh-4rem)] pt-12 pb-4 lg:block hidden"
      />
    </div>
  </template>
}
