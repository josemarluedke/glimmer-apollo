import { module, test } from 'qunit';
import { settled } from '@ember/test-helpers';
import { destroy } from '@ember/destroyable';
import { tracked } from '@glimmer/tracking';
import { setClient, clearClients, useQuery } from 'glimmer-apollo';
import {
  ApolloClient,
  ApolloError,
  InMemoryCache,
  createHttpLink,
  gql
} from '@apollo/client/core';
import {
  UserInfoQuery,
  UserInfoQueryVariables
} from '../dummy/app/mocks/handlers';

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
  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: createHttpLink({
      uri: '/graphql'
    })
  });

  hooks.beforeEach(() => {
    clearClients();
    setClient(client);
    ctx = {};
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
    await query.promise;
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

  test('it refetches tue query when args change', async function (assert) {
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
    await settled();
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
    await settled();

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
    await settled();

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
    await settled();

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
});
