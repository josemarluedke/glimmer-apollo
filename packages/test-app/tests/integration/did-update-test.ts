import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | DidUpdate', function (hooks) {
  setupRenderingTest(hooks);

  const template = hbs`
    <DidUpdate @onDidUpdate={{this.onDidUpdate}} />
  `;

  test('it does not call did-update on refetch', async function (assert) {
    assert.expect(1);

    this.set('onDidUpdate', () => {
      assert.ok(true);
    });

    await render(template);
    await click('[data-test-id="did-update-refetch"]');
  });

  test('it calls did-update once on filter change', async function (assert) {
    assert.expect(2);

    this.set('onDidUpdate', () => {
      assert.ok(true);
    });

    await render(template);
    await click('[data-test-id="did-update-filter"]');
  });

  test('it re-fetches query after mutation', async function (assert) {
    await render(template);
    assert.dom('[data-test-id="color-1"]').containsText('red');
    await click('[data-test-id="color-1"]');
    assert.dom('[data-test-id="color-1"]').containsText('white');
  });
});
