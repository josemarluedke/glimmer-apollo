import { module, test } from 'qunit';
import { settled } from '@ember/test-helpers';
import { destroy } from '@ember/destroyable';
import { setClient, clearClients, useMutation } from 'glimmer-apollo';
import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  gql
} from '@apollo/client/core';
import {
  LoginMutationVariables,
  LoginMutation
} from '../dummy/app/mocks/handlers';

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

  test('it executes the mutation', async function (assert) {
    const mutation = useMutation<LoginMutation, LoginMutationVariables>(
      ctx,
      () => [
        LOGIN,
        {
          variables: { username: 'john' }
        }
      ]
    );

    assert.equal(mutation.loading, false);
    assert.equal(mutation.data, undefined);

    mutation.mutate();
    assert.equal(mutation.loading, true);
    await settled();

    assert.equal(mutation.loading, false);
    assert.equal(mutation.error, undefined);
    assert.deepEqual(mutation.data, {
      user: {
        __typename: 'User',
        firstName: 'Joth',
        id: '2',
        lastName: 'Maverick'
      }
    });
  });

  test('it returns the error', async function (assert) {
    const mutation = useMutation<LoginMutation, LoginMutationVariables>(
      ctx,
      () => [
        LOGIN,
        {
          variables: { username: 'non-existing' }
        }
      ]
    );

    assert.equal(mutation.loading, false);
    assert.equal(mutation.data, undefined);

    mutation.mutate();
    assert.equal(mutation.loading, true);
    await settled();

    assert.equal(mutation.loading, false);
    assert.equal(mutation.data, undefined);
    assert.equal(mutation.error?.message, 'User not found with given username');
  });
});
