import { module, test } from 'qunit';
import { setClient, getClient, clearClients } from 'glimmer-apollo';
import { ApolloClient, InMemoryCache } from '@apollo/client/core';
import { setOwner } from 'glimmer-apollo/-private/environment';

module('setClient & getClient', function (hooks) {
  const ctx = {};
  const owner = {};
  setOwner(ctx, owner);

  const cache = new InMemoryCache();
  const client = new ApolloClient({ cache });

  hooks.beforeEach(() => {
    clearClients(ctx);
  });

  test('setting and getting a client without passing name', function (assert) {
    setClient(ctx, client);
    assert.equal(getClient(ctx), client);
  });

  test('setting and getting client with custom name', function (assert) {
    setClient(ctx, client, 'custom');
    assert.equal(getClient(ctx, 'custom'), client);
  });

  test('getting a client without setting before throws error', function (assert) {
    assert.throws(
      () => getClient(ctx),
      /Apollo client with id default has not been set yet, use setClient/
    );

    assert.throws(
      () => getClient(ctx, 'customClient'),
      /Apollo client with id customClient has not been set yet, use setClient/
    );
  });

  test('geClient/setClient with context withou owner', function (assert) {
    assert.throws(
      () => setClient({}, client),
      / Unable to find owner from the given context in glimmer-apollo setClient/
    );
    assert.throws(
      () => getClient({}),
      / Unable to find owner from the given context in glimmer-apollo getClient/
    );
  });
});
