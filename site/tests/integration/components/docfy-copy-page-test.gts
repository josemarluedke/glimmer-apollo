import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import DocfyCopyPage, {
  markdownPathForPageUrl
} from 'site/components/docfy-copy-page';

/**
 * The Dropdown's menu renders through a Frontile portal, which appends to
 * `document.body` — outside the `#ember-testing` root that `assert.dom` and
 * `click(selector)` search. Look these elements up against the whole document
 * and pass the element itself.
 */
function portalEl(selector: string): HTMLElement {
  const element = document.querySelector(selector);
  if (!(element instanceof HTMLElement)) {
    throw new Error(`Expected to find ${selector} in the rendered portal`);
  }
  return element;
}

module('Integration | Component | docfy-copy-page', function (hooks) {
  setupRenderingTest(hooks);

  let originalFetch: typeof window.fetch;
  let originalOpen: typeof window.open;
  let originalClipboardDescriptor: PropertyDescriptor | undefined;

  hooks.beforeEach(function () {
    originalFetch = window.fetch;
    originalOpen = window.open;
    originalClipboardDescriptor = Object.getOwnPropertyDescriptor(
      navigator,
      'clipboard'
    );
  });

  hooks.afterEach(function () {
    window.fetch = originalFetch;
    window.open = originalOpen;
    if (originalClipboardDescriptor) {
      // clipboard had an own property on navigator (unusual, but possible in
      // some environments) — restore it exactly as it was.
      Object.defineProperty(
        navigator,
        'clipboard',
        originalClipboardDescriptor
      );
    } else if (Object.prototype.hasOwnProperty.call(navigator, 'clipboard')) {
      // clipboard normally lives on Navigator.prototype, so there was no own
      // property to capture — remove the one a test may have defined, so it
      // doesn't leak into later tests.
      delete (navigator as unknown as Record<string, unknown>)['clipboard'];
    }
  });

  test('it renders the primary Copy Markdown button', async function (assert) {
    await render(
      <template>
        <DocfyCopyPage @url="/docs/fetching/queries" @title="Queries" />
      </template>
    );

    assert.dom('[data-test-id="copy-page-primary"]').hasText('Copy Markdown');
  });

  test('copyPage fetches the markdown URL and copies it to the clipboard', async function (assert) {
    let copiedText: string | undefined;

    window.fetch = (async () =>
      new Response('# Queries\n\nExample content.', {
        status: 200
      })) as typeof window.fetch;

    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          copiedText = text;
        }
      }
    });

    await render(
      <template>
        <DocfyCopyPage @url="/docs/fetching/queries" @title="Queries" />
      </template>
    );

    await click('[data-test-id="copy-page-primary"]');

    assert.dom('[data-test-id="copy-page-primary"]').hasText('Copied!');
    assert.strictEqual(copiedText, '# Queries\n\nExample content.');
  });

  test('copyPage shows an error state when the markdown URL 404s', async function (assert) {
    window.fetch = (async () =>
      new Response('', { status: 404 })) as typeof window.fetch;

    await render(
      <template>
        <DocfyCopyPage @url="/docs/fetching/queries" @title="Queries" />
      </template>
    );

    await click('[data-test-id="copy-page-primary"]');

    assert.dom('[data-test-id="copy-page-primary"]').hasText('Unavailable');
  });

  test('the dropdown lists the remaining actions', async function (assert) {
    await render(
      <template>
        <DocfyCopyPage @url="/docs/fetching/queries" @title="Queries" />
      </template>
    );

    await click('[data-test-id="copy-page-trigger"]');

    assert
      .dom(portalEl('[data-key="copy-markdown-url"]'))
      .hasText('Copy Markdown URL');
    assert
      .dom(portalEl('[data-key="view-as-markdown"]'))
      .hasText('View as Markdown');
    assert
      .dom(portalEl('[data-key="open-chatgpt"]'))
      .hasText('Open in ChatGPT');
    assert.dom(portalEl('[data-key="open-claude"]')).hasText('Open in Claude');
  });

  test('"Copy Markdown URL" copies the .md URL itself, not the page contents', async function (assert) {
    const copied: string[] = [];

    window.fetch = (() => {
      assert.step('fetch should not be called');
      return Promise.reject(new Error('unexpected fetch'));
    }) as typeof window.fetch;

    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: (text: string) => {
          copied.push(text);
          return Promise.resolve();
        }
      }
    });

    await render(
      <template>
        <DocfyCopyPage @url="/docs/fetching/queries" @title="Queries" />
      </template>
    );

    await click('[data-test-id="copy-page-trigger"]');
    await click(portalEl('[data-key="copy-markdown-url"]'));

    assert.deepEqual(copied, [
      `${window.location.origin}/docs/fetching/queries.md`
    ]);
    assert.verifySteps([]);
    assert
      .dom('[data-test-id="copy-page-primary"]')
      .hasText('URL copied!', 'the primary button reports what was copied');
  });

  test('"Copy Markdown URL" copies the index.md URL on an index page', async function (assert) {
    const copied: string[] = [];

    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: (text: string) => {
          copied.push(text);
          return Promise.resolve();
        }
      }
    });

    await render(
      <template><DocfyCopyPage @url="/docs/" @title="Introduction" /></template>
    );

    await click('[data-test-id="copy-page-trigger"]');
    await click(portalEl('[data-key="copy-markdown-url"]'));

    assert.deepEqual(copied, [`${window.location.origin}/docs/index.md`]);
  });

  test('"Copy Markdown URL" surfaces a failure when the clipboard rejects', async function (assert) {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: () => Promise.reject(new Error('denied'))
      }
    });

    await render(
      <template>
        <DocfyCopyPage @url="/docs/fetching/queries" @title="Queries" />
      </template>
    );

    await click('[data-test-id="copy-page-trigger"]');
    await click(portalEl('[data-key="copy-markdown-url"]'));

    assert.dom('[data-test-id="copy-page-primary"]').hasText('Unavailable');
  });

  test('"View as markdown" carries the .md URL as a real href, and also opens via keyboard/click through the menu action', async function (assert) {
    const openedUrls: string[] = [];

    window.open = ((url: string) => {
      openedUrls.push(url);
      return null;
    }) as typeof window.open;

    await render(
      <template>
        <DocfyCopyPage @url="/docs/fetching/queries" @title="Queries" />
      </template>
    );

    await click('[data-test-id="copy-page-trigger"]');

    assert
      .dom(portalEl('[data-test-id="copy-page-view-markdown"]'))
      .hasAttribute(
        'href',
        `${window.location.origin}/docs/fetching/queries.md`
      )
      .hasAttribute('target', '_blank')
      .hasAttribute('rel', 'noopener noreferrer');

    await click(portalEl('[data-key="view-as-markdown"]'));

    assert.strictEqual(
      openedUrls[0],
      `${window.location.origin}/docs/fetching/queries.md`
    );
  });

  test('"Open in ChatGPT" and "Open in Claude" open the expected launch URLs', async function (assert) {
    const openedUrls: string[] = [];

    window.open = ((url: string) => {
      openedUrls.push(url);
      return null;
    }) as typeof window.open;

    await render(
      <template>
        <DocfyCopyPage @url="/docs/fetching/queries" @title="Queries" />
      </template>
    );

    await click('[data-test-id="copy-page-trigger"]');
    await click(portalEl('[data-key="open-chatgpt"]'));

    const expectedPrompt =
      'Use web browsing to access this Glimmer Apollo documentation page: ' +
      `${window.location.origin}/docs/fetching/queries.md. ` +
      'I want to ask some questions about Queries.';

    assert.strictEqual(
      openedUrls[0],
      `https://chatgpt.com/?hints=search&q=${encodeURIComponent(expectedPrompt)}`
    );

    await click('[data-test-id="copy-page-trigger"]');
    await click(portalEl('[data-key="open-claude"]'));

    assert.strictEqual(
      openedUrls[1],
      `https://claude.ai/new?q=${encodeURIComponent(expectedPrompt)}`
    );
  });

  test('markdownPathForPageUrl maps index page URLs to their index.md mirror', function (assert) {
    assert.strictEqual(
      markdownPathForPageUrl('/docs/fetching/queries'),
      '/docs/fetching/queries.md'
    );
    assert.strictEqual(markdownPathForPageUrl('/docs/'), '/docs/index.md');
    assert.strictEqual(markdownPathForPageUrl('/'), '/index.md');
    assert.strictEqual(markdownPathForPageUrl('docs/'), '/docs/index.md');
  });

  test('an index page fetches and links to <url>index.md, not <url>.md', async function (assert) {
    const requestedUrls: string[] = [];
    const openedUrls: string[] = [];

    window.fetch = ((input: string) => {
      requestedUrls.push(input);
      return Promise.resolve(new Response('# Introduction', { status: 200 }));
    }) as typeof window.fetch;

    window.open = ((url: string) => {
      openedUrls.push(url);
      return null;
    }) as typeof window.open;

    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: () => Promise.resolve() }
    });

    await render(
      <template><DocfyCopyPage @url="/docs/" @title="Introduction" /></template>
    );

    await click('[data-test-id="copy-page-primary"]');

    assert.deepEqual(requestedUrls, [
      `${window.location.origin}/docs/index.md`
    ]);

    await click('[data-test-id="copy-page-trigger"]');

    assert
      .dom(portalEl('[data-test-id="copy-page-view-markdown"]'))
      .hasAttribute('href', `${window.location.origin}/docs/index.md`);

    await click(portalEl('[data-key="view-as-markdown"]'));

    assert.strictEqual(
      openedUrls[0],
      `${window.location.origin}/docs/index.md`
    );
  });
});
