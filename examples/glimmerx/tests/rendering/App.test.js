import { module, test, renderComponent, setupMirage } from '../util';
import { hbs } from '@glimmerx/component';

import App from '../../src/App';

module('App test', (hooks) => {
  const mirage = setupMirage(hooks);

  test('it works', async (assert) => {
    mirage.server.createList('note', 3);
    await renderComponent(hbs`<App />`);

    assert.dom('h1').containsText('Notes');
  });
});
