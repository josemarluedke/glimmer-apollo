import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render, TestContext, waitFor } from '@ember/test-helpers';

module('Integration | Components | Playground', function (hooks) {
  setupRenderingTest(hooks);

  test('no waiters should be left behind when resource is teardown before resolving', async function (this: TestContext, assert) {
    await render(hbs`<Playground />`);

    click('[dates-test-id="toggle"]');
    await waitFor('[data-test-id="experiment"]', { timeout: 100 });

    await click('[dates-test-id="toggle"]');
    assert.ok(true);
  });
});
