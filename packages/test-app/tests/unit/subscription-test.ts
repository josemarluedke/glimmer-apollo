import { module, test } from 'qunit';
import { waitUntil } from '@ember/test-helpers';
import { destroy } from '@ember/destroyable';
import { tracked } from '@glimmer/tracking';
import { setClient, getClient, useSubscription, gql } from 'glimmer-apollo';
import { setOwner } from '@ember/owner';
import type Owner from '@ember/owner';
import { ApolloClient, ApolloError, InMemoryCache } from '@apollo/client/core';
import {
  OnMessageAddedSubscription,
  OnMessageAddedSubscriptionVariables
} from '../../app/mocks/handlers';
import sinon from 'sinon';
import { MockSubscriptionLink } from 'test-app/tests/helpers/mock-subscription-link';

const SUBSCRIPTION = gql`
  subscription OnMessageAdded($channel: String!) {
    messageAdded(channel: $channel) {
      id
      message
    }
  }
`;

module('useSubscription', function (hooks) {
  const results = ['Hey There!', 'Hello', 'How are you?'].map((
    message,
    id
  ) => ({
    result: {
      data: {
        messageAdded: { __typename: 'Message', id: id.toString(), message }
      }
    }
  }));

  let ctx = {};
  const owner: Owner = {} as Owner;
  const link = new MockSubscriptionLink();

  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link
  });

  hooks.beforeEach(() => {
    ctx = {};
    setOwner(ctx, owner);
    setClient(ctx, client);
  });

  hooks.afterEach(() => {
    destroy(ctx);
  });

  test('it fetches the subscription', async function (assert) {
    link.simulateResult(results[0]);

    const sub = useSubscription<
      OnMessageAddedSubscription,
      OnMessageAddedSubscriptionVariables
    >(ctx, () => [
      SUBSCRIPTION,
      {
        variables: { channel: '1' }
      }
    ]);

    assert.equal(sub.loading, true);
    assert.equal(sub.data, undefined);
    await sub.settled();
    assert.equal(sub.loading, false);
    assert.equal(sub.error, undefined);
    assert.deepEqual(sub.data, {
      messageAdded: {
        __typename: 'Message',
        id: '0',
        message: 'Hey There!'
      }
    });

    link.simulateResult(results[1]);

    await waitUntil(
      function () {
        return sub.data?.messageAdded?.id == '1';
      },
      { timeout: 200 }
    );

    assert.deepEqual(sub.data, {
      messageAdded: {
        __typename: 'Message',
        id: '1',
        message: 'Hello'
      }
    });

    // link.simulateComplete();
  });

  test('it refetches the subscription when args change', async function (assert) {
    link.simulateResult(results[0]);

    class Obj {
      @tracked id = '1';
    }
    const vars = new Obj();

    const sub = useSubscription<
      OnMessageAddedSubscription,
      OnMessageAddedSubscriptionVariables
    >(ctx, () => [
      SUBSCRIPTION,
      {
        variables: { channel: vars.id }
      }
    ]);

    assert.equal(sub.loading, true);
    assert.equal(sub.data, undefined);
    await sub.promise;
    assert.equal(sub.loading, false);
    assert.equal(sub.data?.messageAdded?.id, '0');

    vars.id = '2';
    assert.equal(sub.loading, true);
    assert.equal(sub.data?.messageAdded?.id, '0');

    link.simulateResult(results[1]);

    await sub.promise;
    assert.equal(sub.loading, false);
    assert.equal(sub.data?.messageAdded?.id, '1');
  });

  test('it returns error', async function (assert) {
    const subscriptionError = {
      error: new Error('error occurred')
    };

    link.simulateResult(subscriptionError);

    const sub = useSubscription<
      OnMessageAddedSubscription,
      OnMessageAddedSubscriptionVariables
    >(ctx, () => [
      SUBSCRIPTION,
      {
        variables: { channel: 'NOT_FOUND' }
      }
    ]);

    assert.equal(sub.loading, true);
    assert.equal(sub.data, undefined);
    assert.equal(sub.error, undefined);
    await sub.settled();
    assert.equal(sub.loading, false);
    assert.equal(sub.error?.message, 'error occurred');
    assert.equal(sub.data, undefined);
  });

  test('it calls onData', async function (assert) {
    link.simulateResult(results[0]);

    let onDataCalled: unknown;
    const sub = useSubscription<
      OnMessageAddedSubscription,
      OnMessageAddedSubscriptionVariables
    >(ctx, () => [
      SUBSCRIPTION,
      {
        variables: { channel: '2' },
        onData: (data) => {
          onDataCalled = data;
        }
      }
    ]);

    assert.equal(sub.data, undefined);
    await sub.settled();

    let expectedData = {
      messageAdded: {
        __typename: 'Message',
        id: '0',
        message: 'Hey There!'
      }
    };

    assert.deepEqual(sub.data as unknown, expectedData);
    assert.deepEqual(onDataCalled, expectedData);

    link.simulateResult(results[1]);

    await waitUntil(
      function () {
        return sub.data?.messageAdded?.id == '1';
      },
      { timeout: 200 }
    );

    expectedData = {
      messageAdded: {
        __typename: 'Message',
        id: '1',
        message: 'Hello'
      }
    };

    assert.deepEqual(sub.data as unknown, expectedData);
    assert.deepEqual(onDataCalled, expectedData);

    link.simulateResult(results[2]);

    await waitUntil(
      function () {
        return sub.data?.messageAdded?.id == '2';
      },
      { timeout: 200 }
    );

    expectedData = {
      messageAdded: {
        __typename: 'Message',
        id: '2',
        message: 'How are you?'
      }
    };

    assert.deepEqual(sub.data as unknown, expectedData);
    assert.deepEqual(onDataCalled, expectedData);
  });

  test('it calls onError', async function (assert) {
    const subscriptionError = {
      error: new Error('error occurred')
    };

    link.simulateResult(subscriptionError);

    let onErrorCalled: ApolloError;
    const sub = useSubscription<
      OnMessageAddedSubscription,
      OnMessageAddedSubscriptionVariables
    >(ctx, () => [
      SUBSCRIPTION,
      {
        variables: { channel: 'NOT_FOUND' },
        onError: (error) => {
          onErrorCalled = error;
        }
      }
    ]);

    assert.equal(sub.error, undefined);
    await sub.settled();

    const expectedError = 'error occurred';
    assert.equal(sub.error?.message, expectedError);
    assert.equal(onErrorCalled!.message, expectedError);
  });

  test('it calls onComplete', async function (assert) {
    link.simulateResult(results[0]);

    let onCompleteCalled = false;
    const sub = useSubscription<
      OnMessageAddedSubscription,
      OnMessageAddedSubscriptionVariables
    >(ctx, () => [
      SUBSCRIPTION,
      {
        variables: { channel: '2' },
        onComplete: () => {
          onCompleteCalled = true;
        }
      }
    ]);

    assert.equal(sub.data, undefined);
    await sub.settled();

    link.simulateComplete();

    assert.deepEqual(
      onCompleteCalled,
      true,
      'onComplete should have been called'
    );
  });

  test('it does not trigger subscription update if args references changes but values are the same', async function (assert) {
    link.simulateResult(results[0]);
    class Obj {
      @tracked id = '1';
    }
    const vars = new Obj();
    const sandbox = sinon.createSandbox();
    const client = getClient(ctx);

    const subscribe = sandbox.spy(client, 'subscribe');
    const sub = useSubscription<
      OnMessageAddedSubscription,
      OnMessageAddedSubscriptionVariables
    >(ctx, () => [
      SUBSCRIPTION,
      {
        variables: { channel: vars.id }
      }
    ]);

    assert.equal(sub.data, undefined);
    await sub.settled();

    vars.id = '1';
    await sub.settled();

    assert.ok(subscribe.calledOnce);

    sandbox.restore();
  });

  test('it uses correct client based on clientId option', async function (assert) {
    link.simulateResult(results[0]);

    class Obj {
      @tracked id = '1';
    }
    const vars = new Obj();
    const sandbox = sinon.createSandbox();
    const defaultClient = getClient(ctx);
    const customClient = new ApolloClient({
      cache: new InMemoryCache(),
      link
    });
    setClient(ctx, customClient, 'custom-client');

    const defaultClientWatchsub = sandbox.spy(defaultClient, 'subscribe');
    const customClientWatchsub = sandbox.spy(customClient, 'subscribe');

    const sub = useSubscription<
      OnMessageAddedSubscription,
      OnMessageAddedSubscriptionVariables
    >(ctx, () => [
      SUBSCRIPTION,
      {
        variables: { channel: vars.id },
        clientId: 'custom-client'
      }
    ]);

    await sub.settled();
    assert.ok(customClientWatchsub.calledOnce, 'custom client should be used');
    assert.ok(
      defaultClientWatchsub.notCalled,
      'default client should not be used'
    );

    sandbox.restore();
  });
});
