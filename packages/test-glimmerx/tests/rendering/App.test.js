import {
  module,
  test,
  renderComponent,
  setupApollo,
  setupMirage
} from '../util';

import App from '../../src/App';

module('App test', (hooks) => {
  const mirage = setupMirage(hooks);
  setupApollo(hooks);

  test('it works', async (assert) => {
    mirage.server.createList('note', 3);
    await renderComponent(App);

    assert.dom('h1').containsText('Notes');
  });
});
