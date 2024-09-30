import { module, test } from 'qunit';
import { destroy } from '@ember/destroyable';
import { tracked } from '@glimmer/tracking';
import { setClient, getClient, useQuery, gql } from 'glimmer-apollo';
import { setOwner } from '@ember/application';
import {
  ApolloClient,
  ApolloError,
  InMemoryCache,
  WatchQueryFetchPolicy,
  createHttpLink
} from '@apollo/client/core';
import {
  UserInfoQuery,
  UserInfoQueryVariables
} from '../../app/mocks/handlers';
import sinon from 'sinon';
import { waitUntil } from '@ember/test-helpers';

const USER_INFO = gql`
  query UserInfo($id: ID!) {
    user(id: $id) {
      id
      firstName
      lastName
    }
  }
`;

module('useQuery', function (hooks) {
  let ctx = {};
  const owner = {};

  const link = createHttpLink({
    uri: '/graphql'
  });

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

  test('it fetches the query', async function (assert) {
    const query = useQuery<UserInfoQuery, UserInfoQueryVariables>(ctx, () => [
      USER_INFO,
      {
        variables: { id: '1' }
      }
    ]);

    assert.equal(query.loading, true);
    assert.equal(query.data, undefined);
    await query.settled();
    assert.equal(query.loading, false);
    assert.equal(query.error, undefined);
    assert.deepEqual(query.data, {
      user: {
        __typename: 'User',
        firstName: 'Cathaline',
        id: '1',
        lastName: 'McCoy'
      }
    });
  });

  test('it refetches the query when args change', async function (assert) {
    class Obj {
      @tracked id = '1';
    }
    const vars = new Obj();

    const query = useQuery<UserInfoQuery, UserInfoQueryVariables>(ctx, () => [
      USER_INFO,
      {
        variables: { id: vars.id }
      }
    ]);

    assert.equal(query.loading, true);
    assert.equal(query.data, undefined);
    await query.promise;
    assert.equal(query.loading, false);
    assert.equal(query.data?.user?.id, '1');

    vars.id = '2';
    assert.equal(query.loading, true);
    assert.equal(query.data?.user?.id, '1');
    await query.promise;
    assert.equal(query.loading, false);
    assert.equal(query.data?.user?.id, '2');
  });

  test('it returns error', async function (assert) {
    const query = useQuery<UserInfoQuery, UserInfoQueryVariables>(ctx, () => [
      USER_INFO,
      {
        variables: { id: 'NOT_FOUND' }
      }
    ]);

    assert.equal(query.loading, true);
    assert.equal(query.data, undefined);
    assert.equal(query.error, undefined);
    await query.settled();
    assert.equal(query.loading, false);
    assert.equal(query.error?.message, 'User not found');
    assert.equal(query.data, undefined);
  });

  test('it calls onComplete', async function (assert) {
    let onCompleteCalled: unknown;
    const query = useQuery<UserInfoQuery, UserInfoQueryVariables>(ctx, () => [
      USER_INFO,
      {
        variables: { id: '2' },
        onComplete: (data) => {
          onCompleteCalled = data;
        }
      }
    ]);

    assert.equal(query.data, undefined);
    await query.settled();

    const expectedData = {
      user: {
        __typename: 'User',
        firstName: 'Joth',
        id: '2',
        lastName: 'Maverick'
      }
    };

    assert.deepEqual(query.data as unknown, expectedData);
    assert.deepEqual(onCompleteCalled, expectedData);
  });

  test('it does not call onCompleted if skip is true', async function (assert) {
    const sandbox = sinon.createSandbox();
    const onCompleteCallback = sandbox.fake();
    const query = useQuery<UserInfoQuery, UserInfoQueryVariables>(ctx, () => [
      USER_INFO,
      {
        variables: { id: '2' },
        skip: true,
        onComplete: onCompleteCallback
      }
    ]);

    await query.settled();
    assert.equal(query.loading, false);
    assert.equal(query.data, undefined);
    assert.equal(onCompleteCallback.callCount, 0);

    sandbox.restore();
  });

  test('it calls onError', async function (assert) {
    let onErrorCalled: ApolloError;
    const query = useQuery<UserInfoQuery, UserInfoQueryVariables>(ctx, () => [
      USER_INFO,
      {
        variables: { id: 'NOT_FOUND' },
        onError: (error) => {
          onErrorCalled = error;
        }
      }
    ]);

    assert.equal(query.error, undefined);
    await query.settled();

    const expectedError = 'User not found';
    assert.equal(query.error?.message, expectedError);
    assert.equal(onErrorCalled!.message, expectedError);
  });

  test('it returns error with data', async function (assert) {
    let onCompleteCalled: unknown;
    let onErrorCalled: ApolloError;
    const query = useQuery<UserInfoQuery, UserInfoQueryVariables>(ctx, () => [
      USER_INFO,
      {
        variables: { id: '2-with-error' },
        errorPolicy: 'all',
        onComplete: (data) => {
          onCompleteCalled = data;
        },
        onError: (error) => {
          onErrorCalled = error;
        }
      }
    ]);

    assert.equal(query.data, undefined);
    await query.settled();

    const expectedData = {
      user: {
        __typename: 'User',
        firstName: 'Joth',
        id: '2',
        lastName: 'Maverick'
      }
    };

    assert.deepEqual(query.data as unknown, expectedData);
    assert.equal(
      onCompleteCalled,
      undefined,
      'onComplete should not be called when there are errors'
    );

    const expectedError = 'Data With Error';
    assert.equal(query.error?.message, expectedError);
    assert.equal(onErrorCalled!.message, expectedError);
  });

  test('it does not trigger query update if args references changes but values are the same', async function (assert) {
    class Obj {
      @tracked id = '1';
    }
    const vars = new Obj();
    const sandbox = sinon.createSandbox();
    const client = getClient(ctx);

    const watchQuery = sandbox.spy(client, 'watchQuery');
    const query = useQuery<UserInfoQuery, UserInfoQueryVariables>(ctx, () => [
      USER_INFO,
      {
        variables: { id: vars.id }
      }
    ]);

    assert.equal(query.data, undefined);
    await query.settled();

    vars.id = '1';
    await query.settled();

    assert.ok(watchQuery.calledOnce);

    sandbox.restore();
  });

  test('it uses correct client based on clientId option', async function (assert) {
    class Obj {
      @tracked id = '1';
    }
    const vars = new Obj();
    const sandbox = sinon.createSandbox();
    const defaultClient = getClient(ctx);
    const customClient = new ApolloClient({
      cache: new InMemoryCache(),
      link: createHttpLink({
        uri: '/graphql'
      })
    });
    setClient(ctx, customClient, 'custom-client');

    const defaultClientWatchQuery = sandbox.spy(defaultClient, 'watchQuery');
    const customClientWatchQuery = sandbox.spy(customClient, 'watchQuery');

    const query = useQuery<UserInfoQuery, UserInfoQueryVariables>(ctx, () => [
      USER_INFO,
      {
        variables: { id: vars.id },
        clientId: 'custom-client'
      }
    ]);

    await query.settled();
    assert.ok(
      customClientWatchQuery.calledOnce,
      'custom client should be used'
    );
    assert.ok(
      defaultClientWatchQuery.notCalled,
      'default client should not be used'
    );

    sandbox.restore();
  });

  test('it skips running a query when skip is true', async function (assert) {
    class Obj {
      @tracked skip = true;
    }
    const options = new Obj();

    const query = useQuery<UserInfoQuery, UserInfoQueryVariables>(ctx, () => [
      USER_INFO,
      {
        variables: { id: '1' },
        skip: options.skip
      }
    ]);

    assert.equal(query.loading, false);
    assert.equal(query.data, undefined);

    options.skip = false;

    assert.equal(query.loading, true);
    assert.equal(query.data, undefined);
    await query.settled();
    assert.equal(query.loading, false);
    assert.deepEqual(query.data, {
      user: {
        __typename: 'User',
        firstName: 'Cathaline',
        id: '1',
        lastName: 'McCoy'
      }
    });
  });

  test('it does not make network requests when skip is true', async function (assert) {
    const sandbox = sinon.createSandbox();

    const requestSpy = sandbox.fake(link.request);
    sandbox.replace(link, 'request', requestSpy);

    class Obj {
      @tracked skip = false;
      @tracked id = '1';
    }
    const options = new Obj();

    const query = useQuery<UserInfoQuery, UserInfoQueryVariables>(ctx, () => [
      USER_INFO,
      {
        variables: { id: options.id },
        skip: options.skip
      }
    ]);

    assert.equal(query.loading, true);
    assert.equal(query.data, undefined);

    await query.settled();
    assert.equal(query.loading, false);
    assert.deepEqual(query.data, {
      user: {
        __typename: 'User',
        firstName: 'Cathaline',
        id: '1',
        lastName: 'McCoy'
      }
    });

    options.skip = true;
    options.id = '2';

    await query.settled();
    assert.equal(query.loading, false);
    assert.deepEqual(query.data, {
      user: {
        __typename: 'User',
        firstName: 'Cathaline',
        id: '1',
        lastName: 'McCoy'
      }
    });
    assert.equal(requestSpy.callCount, 1);

    sandbox.restore();
  });

  test('it treats fetchPolicy standby like skip', async function (assert) {
    class Obj {
      @tracked fetchPolicy: WatchQueryFetchPolicy = 'standby';
    }
    const options = new Obj();

    const query = useQuery<UserInfoQuery, UserInfoQueryVariables>(ctx, () => [
      USER_INFO,
      {
        variables: { id: '1' },
        fetchPolicy: options.fetchPolicy
      }
    ]);

    assert.equal(query.loading, false);
    assert.equal(query.data, undefined);

    await query.settled();

    options.fetchPolicy = 'cache-first';
    assert.equal(query.data, undefined);

    await query.settled();
    assert.deepEqual(query.data, {
      user: {
        __typename: 'User',
        firstName: 'Cathaline',
        id: '1',
        lastName: 'McCoy'
      }
    });
  });

  test('it refetches the query when skip is true', async function (assert) {
    const sandbox = sinon.createSandbox();

    const requestSpy = sandbox.fake(link.request);
    sandbox.replace(link, 'request', requestSpy);

    const query = useQuery<UserInfoQuery, UserInfoQueryVariables>(ctx, () => [
      USER_INFO,
      {
        variables: { id: '1' },
        skip: true
      }
    ]);

    query.refetch();

    assert.equal(query.loading, false);
    await waitUntil(() => query.data !== undefined);
    assert.ok(requestSpy.calledOnce);
    assert.equal(query.loading, false);
    assert.equal(query.networkStatus, 7);
    assert.deepEqual(query.data, {
      user: {
        __typename: 'User',
        firstName: 'Cathaline',
        id: '1',
        lastName: 'McCoy'
      }
    });

    sandbox.restore();
  });
});
