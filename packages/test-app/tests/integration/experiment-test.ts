import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | Experiment', function (hooks) {
  setupRenderingTest(hooks);

  const template = hbs`
    <Playground::Experiment @onDidUpdate={{this.onDidUpdate}} />
  `;

  test('it calls did-update once', async function (assert) {
    assert.expect(2);

    this.set('onDidUpdate', () => {
      assert.ok(true);
    });

    await render(template);
    await click('[data-test-id="experiment-user-refetch"]');
  });
});
