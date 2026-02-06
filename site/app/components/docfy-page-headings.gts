import Component from '@glimmer/component';
import { on } from '@ember/modifier';
import { DocfyOutput } from '@docfy/ember';

interface Signature {
  Args: {
    currentHeadingId?: string;
  };
  Element: HTMLDivElement;
}

// Easing function for smooth scroll
const easeInOutQuad = (t: number, b: number, c: number, d: number): number => {
  t /= d / 2;
  if (t < 1) {
    return (c / 2) * t * t + b;
  }
  t--;
  return (-c / 2) * (t * (t - 2) - 1) + b;
};

function scrollTo(
  toPosition: number,
  callback?: () => void,
  duration = 500
): void {
  const scrollingElement = document.scrollingElement
    ? document.scrollingElement
    : document.body;
  const startPosition = scrollingElement.scrollTop;
  const change = toPosition - startPosition;
  let currentTime = 0;
  const increment = 20;

  const animateScroll = (): void => {
    currentTime += increment;
    scrollingElement.scrollTop = easeInOutQuad(
      currentTime,
      startPosition,
      change,
      duration
    );

    if (currentTime < duration) {
      requestAnimationFrame(animateScroll);
    } else {
      if (callback && typeof callback === 'function') {
        callback();
      }
    }
  };
  animateScroll();
}

function scrollToElement(
  element: HTMLElement,
  callback?: () => void,
  duration = 500
): void {
  const toPosition = element.offsetTop;
  scrollTo(toPosition, callback, duration);
}

function eq(a: unknown, b: unknown): boolean {
  return a === b;
}

export default class DocfyPageHeadings extends Component<Signature> {
  onClick = (evt: MouseEvent): void => {
    const href = (evt.target as HTMLElement).getAttribute('href');
    if (href) {
      const toElement = document.querySelector(href) as HTMLElement;
      if (toElement) {
        scrollToElement(toElement);
      }
    }
  };

  <template>
    <div
      class="overflow-y-auto sticky top-16 max-h-[calc(100vh-4rem)] pt-12 pb-4 -mt-12 text-sm"
      ...attributes
    >
      <DocfyOutput @fromCurrentURL={{true}} as |page|>
        {{#if page.headings.length}}
          <ul>
            {{#each page.headings as |heading|}}
              <li class="pb-2 border-l border-gray-400 dark:border-gray-700">
                <a
                  href="#{{heading.id}}"
                  class="transition block px-2 py-1 border-l-2 hover:text-pink-700 dark:hover:text-pink-300
                    {{if
                      (eq heading.id @currentHeadingId)
                      'border-pink-700 text-pink-700 dark:border-pink-400 dark:text-pink-400'
                      'border-transparent'
                    }}"
                  {{on "click" this.onClick}}
                >
                  {{heading.title}}
                </a>

                {{#if heading.headings.length}}
                  <ul>
                    {{#each heading.headings as |subHeading|}}
                      <li>
                        <a
                          href="#{{subHeading.id}}"
                          class="transition block pl-6 py-1 border-l-2 hover:text-pink-700 dark:hover:text-pink-300
                            {{if
                              (eq subHeading.id @currentHeadingId)
                              'border-pink-700 text-pink-700 dark:border-pink-400 dark:text-pink-400'
                              'border-transparent'
                            }}"
                          {{on "click" this.onClick}}
                        >
                          {{subHeading.title}}
                        </a>
                      </li>
                    {{/each}}
                  </ul>
                {{/if}}
              </li>
            {{/each}}
          </ul>
        {{/if}}
      </DocfyOutput>
    </div>
  </template>
}
