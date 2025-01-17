import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render, waitFor } from '@ember/test-helpers';
import Playground from 'test-app/components/playground';

module('Integration | Components | Playground', function (hooks) {
  setupRenderingTest(hooks);

  test('no waiters should be left behind when resource is teardown before resolving', async function (assert) {
    await render(<template><Playground /></template>);

    click('[dates-test-id="toggle"]');
    await waitFor('[data-test-id="experiment"]', { timeout: 100 });

    await click('[dates-test-id="toggle"]');
    assert.ok(true);
  });
});
