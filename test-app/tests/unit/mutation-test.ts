/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { module, test } from 'qunit';
import { destroy } from '@ember/destroyable';
import {
  setClient,
  clearClients,
  useMutation,
  getClient,
  gql,
} from 'glimmer-apollo';
import { setOwner } from '@ember/owner';
import type Owner from '@ember/owner';
import { tracked } from '@glimmer/tracking';
import {
  ApolloClient,
  ApolloError,
  InMemoryCache,
  createHttpLink,
} from '@apollo/client/core';
import {
  type LoginMutationVariables,
  type LoginMutation,
} from '../../app/mocks/handlers';
import sinon from 'sinon';

const LOGIN = gql`
  mutation Login($username: String!) {
    login(username: $username) {
      id
      firstName
      lastName
    }
  }
`;

module('useMutation', function (hooks) {
  let ctx = {};
  const owner: Owner = {} as Owner;

  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: createHttpLink({
      uri: '/graphql',
    }),
  });

  hooks.beforeEach(() => {
    ctx = {};
    setOwner(ctx, owner);

    clearClients(ctx);
    setClient(ctx, client);
  });

  hooks.afterEach(() => {
    destroy(ctx);
  });

  test('it executes the mutation', async function (assert) {
    const mutation = useMutation<LoginMutation, LoginMutationVariables>(
      ctx,
      () => [
        LOGIN,
        {
          variables: { username: 'john' },
        },
      ]
    );

    assert.equal(mutation.loading, false);
    assert.equal(mutation.called, false);
    assert.equal(mutation.data, undefined);

    mutation.mutate();
    assert.equal(mutation.loading, true);
    await mutation.settled();

    assert.equal(mutation.loading, false);
    assert.equal(mutation.called, true);
    assert.equal(mutation.error, undefined);
    assert.deepEqual(mutation.data, {
      login: {
        __typename: 'User',
        firstName: 'Joth',
        id: '2',
        lastName: 'Maverick',
      },
    });
  });

  test('it returns error', async function (assert) {
    const mutation = useMutation<LoginMutation, LoginMutationVariables>(
      ctx,
      () => [
        LOGIN,
        {
          variables: { username: 'non-existing' },
        },
      ]
    );

    assert.equal(mutation.loading, false);
    assert.equal(mutation.called, false);
    assert.equal(mutation.data, undefined);

    mutation.mutate();
    assert.equal(mutation.loading, true);
    await mutation.settled();

    assert.equal(mutation.loading, false);
    assert.equal(mutation.called, true);
    assert.equal(mutation.data, undefined);
    assert.equal(mutation.error?.message, 'User not found with given username');
  });

  test('it uses variables passed into mutate', function (assert) {
    const sandbox = sinon.createSandbox();
    const client = getClient(ctx);

    const mutate = sandbox.spy(client, 'mutate');
    const mutation = useMutation<LoginMutation, LoginMutationVariables>(
      ctx,
      () => [
        LOGIN,
        {
          variables: { username: 'non-existing' },
        },
      ]
    );

    mutation.mutate({ username: 'john' });

    assert.ok(mutate.called);
    assert.deepEqual(mutate.args[0]![0].variables, { username: 'john' });

    sandbox.restore();
  });

  test('it merges variables passed into mutate', function (assert) {
    const sandbox = sinon.createSandbox();
    const client = getClient(ctx);

    const mutate = sandbox.spy(client, 'mutate');
    const mutation = useMutation<LoginMutation, LoginMutationVariables>(
      ctx,
      () => [
        LOGIN,
        {
          variables: { username: 'non-existing' },
        },
      ]
    );

    mutation.mutate({ username: 'john', isCool: true } as never);

    assert.ok(mutate.called);
    assert.deepEqual(mutate.args[0]![0].variables, {
      isCool: true,
      username: 'john',
    });

    sandbox.restore();
  });

  test('it merges options passed into mutate', function (assert) {
    const sandbox = sinon.createSandbox();
    const client = getClient(ctx);

    const mutate = sandbox.spy(client, 'mutate');
    const mutation = useMutation<LoginMutation, LoginMutationVariables>(
      ctx,
      () => [
        LOGIN,
        {
          variables: { username: 'non-existing' },
          awaitRefetchQueries: true,
        },
      ]
    );

    mutation.mutate(undefined, { refetchQueries: ['CollQuery'] });

    assert.ok(mutate.called);
    assert.equal(mutate.args[0]![0].awaitRefetchQueries, true);
    assert.deepEqual(mutate.args[0]![0].refetchQueries, ['CollQuery']);

    sandbox.restore();
  });

  test('it calls onComplete', async function (assert) {
    let onCompleteCalled: unknown;
    const mutation = useMutation<LoginMutation, LoginMutationVariables>(
      ctx,
      () => [
        LOGIN,
        {
          variables: { username: 'john' },
          onComplete: (data) => {
            onCompleteCalled = data;
          },
        },
      ]
    );

    assert.equal(mutation.data, undefined);
    mutation.mutate();
    await mutation.settled();

    const expectedData = {
      login: {
        __typename: 'User',
        firstName: 'Joth',
        id: '2',
        lastName: 'Maverick',
      },
    };

    assert.deepEqual(mutation.data as unknown, expectedData);
    assert.deepEqual(onCompleteCalled, expectedData);
  });

  test('it calls onError', async function (assert) {
    let onErrorCalled: ApolloError;
    const mutation = useMutation<LoginMutation, LoginMutationVariables>(
      ctx,
      () => [
        LOGIN,
        {
          variables: { username: 'non-existing' },
          onError: (error) => {
            onErrorCalled = error;
          },
        },
      ]
    );

    assert.equal(mutation.error, undefined);
    mutation.mutate();
    await mutation.settled();

    assert.equal(mutation.error?.message, 'User not found with given username');
    assert.equal(onErrorCalled!.message, 'User not found with given username');
  });

  test('it returns error with data', async function (assert) {
    let onCompleteCalled: unknown;
    let onErrorCalled: ApolloError;
    const mutation = useMutation<LoginMutation, LoginMutationVariables>(
      ctx,
      () => [
        LOGIN,
        {
          variables: { username: 'with-error' },
          errorPolicy: 'all',
          onComplete: (data) => {
            onCompleteCalled = data;
          },
          onError: (error) => {
            onErrorCalled = error;
          },
        },
      ]
    );

    assert.equal(mutation.error, undefined);
    mutation.mutate();
    await mutation.settled();

    const expectedData = {
      login: {
        __typename: 'User',
        firstName: 'Joth',
        id: '2',
        lastName: 'Maverick',
      },
    };

    assert.deepEqual(mutation.data as unknown, expectedData);
    assert.equal(
      onCompleteCalled,
      undefined,
      'onComplete should not be called when there are errors'
    );
    assert.equal(mutation.error?.message, 'Error with Data');
    assert.equal(onErrorCalled!.message, 'Error with Data');
  });

  test('it updates when args changes', function (assert) {
    class Obj {
      @tracked username = 'non-existing';
    }
    const vars = new Obj();
    const sandbox = sinon.createSandbox();
    const client = getClient(ctx);

    const mutate = sandbox.spy(client, 'mutate');
    const mutation = useMutation<LoginMutation, LoginMutationVariables>(
      ctx,
      () => [
        LOGIN,
        {
          variables: { username: vars.username },
        },
      ]
    );

    mutation.mutate();

    assert.ok(mutate.called);
    assert.deepEqual(mutate.args[0]![0].variables, {
      username: 'non-existing',
    });

    vars.username = 'john';

    mutation.mutate();

    assert.deepEqual(mutate.args[1]![0].variables, {
      username: 'john',
    });

    sandbox.restore();
  });

  test('it uses correct client based on clientId option', function (assert) {
    class Obj {
      @tracked username = 'non-existing';
    }
    const vars = new Obj();
    const sandbox = sinon.createSandbox();
    const defaultClient = getClient(ctx);
    const customClient = new ApolloClient({
      cache: new InMemoryCache(),
      link: createHttpLink({
        uri: '/graphql',
      }),
    });
    setClient(ctx, customClient, 'custom-client');

    const defaultMutate = sandbox.spy(defaultClient, 'mutate');
    const customMutate = sandbox.spy(customClient, 'mutate');

    const mutation = useMutation<LoginMutation, LoginMutationVariables>(
      ctx,
      () => [
        LOGIN,
        {
          variables: { username: vars.username },
          clientId: 'custom-client',
        },
      ]
    );

    mutation.mutate();

    assert.ok(customMutate.calledOnce, 'custom client should be used');
    assert.ok(defaultMutate.notCalled, 'default client should not be used');

    sandbox.restore();
  });
});
