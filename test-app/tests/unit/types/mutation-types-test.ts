import { module, test } from 'qunit';
import { useMutation } from 'glimmer-apollo';
import type { MutationResource } from 'glimmer-apollo';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  LoginMutation,
  LoginMutationVariables,
} from '../../../app/mocks/handlers';
import { expectTypeOf } from 'expect-type';

const LOGIN = {} as TypedDocumentNode<LoginMutation, LoginMutationVariables>;
const ctx = {};

function _typeAssertions() {
  // Modern: infers TData and TVariables from TypedDocumentNode.
  const useMutationModern =
    useMutation as unknown as useMutation.Signatures.Modern;
  const m = useMutationModern(ctx, () => [LOGIN]);
  expectTypeOf(m).toEqualTypeOf<
    MutationResource<LoginMutation, LoginMutationVariables>
  >();

  // Modern: rejects structurally wrong variables.
  useMutationModern(ctx, () => [
    LOGIN,
    // @ts-expect-error - username should be string, not number
    { variables: { username: 123 } },
  ]);

  // Subsumes proapi-webapp patch: variables at the options site is optional
  // even when TVariables has required fields. The mutation has required
  // `username`, and useMutation must compile with no options provided.
  const noOpts = useMutation<LoginMutation, LoginMutationVariables>(ctx, () => [
    LOGIN,
  ]);
  expectTypeOf(noOpts).toEqualTypeOf<
    MutationResource<LoginMutation, LoginMutationVariables>
  >();

  // Classic: explicit generics still type-check.
  const useMutationClassic =
    useMutation as unknown as useMutation.Signatures.Classic;
  const mc = useMutationClassic<LoginMutation, LoginMutationVariables>(
    ctx,
    () => [LOGIN, { variables: { username: 'a' } }]
  );
  expectTypeOf(mc).toEqualTypeOf<
    MutationResource<LoginMutation, LoginMutationVariables>
  >();
}

expectTypeOf(useMutation).toExtend<useMutation.Signatures.Classic>();

module('type | useMutation', function () {
  test('compiles (type-only)', function (assert) {
    assert.ok(_typeAssertions);
  });
});
