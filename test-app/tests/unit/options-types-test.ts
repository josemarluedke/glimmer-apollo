import { module, test } from 'qunit';
import { destroy } from '@ember/destroyable';
import { setClient, useQuery, useMutation, gql } from 'glimmer-apollo';
import { setOwner } from '@ember/owner';
import type Owner from '@ember/owner';
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import {
  type UserInfoQuery,
  type UserInfoQueryVariables,
  type LoginMutation,
  type LoginMutationVariables,
} from '../../app/mocks/handlers';

const USER_INFO = gql`
  query UserInfo($id: ID!) {
    user(id: $id) {
      id
      firstName
      lastName
    }
  }
`;

const LOGIN = gql`
  mutation Login($username: String!) {
    login(username: $username) {
      id
      firstName
      lastName
    }
  }
`;

// These tests exist to be type-checked by `ember-tsc --noEmit`. Apollo Client 4
// makes `variables` required on its own options types whenever an operation has
// a non-optional variable. glimmer-apollo lets variables arrive later — via
// `refetch()` on a skipped query, or via `mutate()` — so our options types must
// keep `variables` optional. Each case below fails to compile if that
// requirement leaks through.
module('options types', function (hooks) {
  let ctx = {};
  const owner: Owner = {} as Owner;

  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({ uri: '/graphql' }),
  });

  hooks.beforeEach(() => {
    ctx = {};
    setOwner(ctx, owner);
    setClient(ctx, client);
  });

  hooks.afterEach(() => {
    destroy(ctx);
  });

  test('a skipped query accepts options without variables', function (assert) {
    const query = useQuery<UserInfoQuery, UserInfoQueryVariables>(ctx, () => [
      USER_INFO,
      { skip: true },
    ]);

    assert.ok(query);
  });

  test('a query accepts an options thunk that may return an empty object', function (assert) {
    // The wrapper pattern from the docs: a caller may or may not supply args.
    function useUserInfoQuery(
      context: object,
      args?: () => { variables: UserInfoQueryVariables }
    ) {
      return useQuery<UserInfoQuery, UserInfoQueryVariables>(context, () => [
        USER_INFO,
        args ? args() : {},
      ]);
    }

    assert.ok(useUserInfoQuery(ctx));
  });

  test('a mutation accepts options that only configure refetching', function (assert) {
    const mutation = useMutation<LoginMutation, LoginMutationVariables>(
      ctx,
      () => [
        LOGIN,
        {
          refetchQueries: ['UserInfo'],
          awaitRefetchQueries: true,
        },
      ]
    );

    assert.ok(mutation);
  });

  test('variables are still type-checked when provided', function (assert) {
    const query = useQuery<UserInfoQuery, UserInfoQueryVariables>(ctx, () => [
      USER_INFO,
      {
        // @ts-expect-error - `id` must be a string, not a number
        variables: { id: 1 },
      },
    ]);

    assert.ok(query);
  });
});
