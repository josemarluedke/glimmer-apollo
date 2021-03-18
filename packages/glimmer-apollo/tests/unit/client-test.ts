import { module, test } from 'qunit';
import { setClient, getClient, clearClients } from 'glimmer-apollo';
import { ApolloClient, InMemoryCache } from '@apollo/client/core';

module('setClient & getClient', function (hooks) {
  const cache = new InMemoryCache();
  const client = new ApolloClient({ cache });

  hooks.beforeEach(() => {
    clearClients();
  });

  test('setting and getting a client without passing name', function (assert) {
    setClient(client);
    assert.equal(getClient(), client);
  });

  test('setting and getting client with custom name', function (assert) {
    setClient(client, 'custom');
    assert.equal(getClient('custom'), client);
  });

  test('getting a client without setting before throws error', function (assert) {
    assert.throws(
      () => getClient(),
      /default ApolloClient has not been set yet, use setClient/
    );

    assert.throws(
      () => getClient('customClient'),
      /customClient ApolloClient has not been set yet, use setClient/
    );
  });
});
