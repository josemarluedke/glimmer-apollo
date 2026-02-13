import { module, test } from 'qunit';
import {
  setClient,
  getClient,
  clearClient,
  clearClients,
} from 'glimmer-apollo';
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { destroy } from '@ember/destroyable';
import { setOwner } from '@ember/owner';
import type Owner from '@ember/owner';

module('setClient & getClient', function (hooks) {
  let ctx = {};
  const owner: Owner = {} as Owner;

  const cache = new InMemoryCache();
  const link = new HttpLink({ uri: '/graphql' });
  const client = new ApolloClient({ cache, link });

  hooks.beforeEach(() => {
    ctx = {};
    setOwner(ctx, owner);
  });

  hooks.afterEach(() => {
    destroy(ctx);
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
    assert.throws(() => {
      setClient({}, client);
    }, / Unable to find owner from the given context in glimmer-apollo setClient/);
    assert.throws(
      () => getClient({}),
      / Unable to find owner from the given context in glimmer-apollo getClient/
    );
  });

  test('clearClient removes the client from context', function (assert) {
    setClient(ctx, client);
    setClient(ctx, client, 'customClient');
    assert.equal(getClient(ctx), client);
    assert.equal(getClient(ctx, 'customClient'), client);

    clearClient(ctx);

    assert.equal(
      getClient(ctx, 'customClient'),
      client,
      'should not have removed customClient'
    );

    assert.throws(
      () => getClient(ctx),
      /Apollo client with id default has not been set yet, use setClient/
    );
  });

  test('clearClients removes all clients from context', function (assert) {
    setClient(ctx, client);
    setClient(ctx, client, 'customClient');
    assert.equal(getClient(ctx), client);
    assert.equal(getClient(ctx, 'customClient'), client);
    clearClients(ctx);

    assert.throws(
      () => getClient(ctx),
      /Apollo client with id default has not been set yet, use setClient/
    );

    assert.throws(
      () => getClient(ctx, 'customClient'),
      /Apollo client with id customClient has not been set yet, use setClient/
    );
  });
});
