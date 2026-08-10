import { module, test } from 'qunit';
import { useQuery } from 'glimmer-apollo';
import type { QueryResource } from 'glimmer-apollo';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  UserInfoQuery,
  UserInfoQueryVariables,
} from '../../../app/mocks/handlers';
import { expectTypeOf } from 'expect-type';

const USER_INFO = {} as TypedDocumentNode<
  UserInfoQuery,
  UserInfoQueryVariables
>;
const ctx = {};

// Type-only assertions. The hook calls below would fail at runtime without an
// Ember owner — this function is never invoked, but its body is still
// type-checked by ember-tsc as part of the test project.
function _typeAssertions() {
  // Modern: infers TData and TVariables from TypedDocumentNode.
  const useQueryModern = useQuery as unknown as useQuery.Signatures.Modern;
  const q = useQueryModern(ctx, () => [USER_INFO, { variables: { id: '1' } }]);
  expectTypeOf(q).toEqualTypeOf<
    QueryResource<UserInfoQuery, UserInfoQueryVariables>
  >();
  expectTypeOf(q.data).toEqualTypeOf<UserInfoQuery | undefined>();

  // Modern: rejects structurally wrong variables.
  useQueryModern(ctx, () => [
    USER_INFO,
    // @ts-expect-error - id should be string, not number
    { variables: { id: 123 } },
  ]);

  // Classic: explicit generics still type-check.
  const useQueryClassic = useQuery as unknown as useQuery.Signatures.Classic;
  const qc = useQueryClassic<UserInfoQuery, UserInfoQueryVariables>(ctx, () => [
    USER_INFO,
    { variables: { id: '1' } },
  ]);
  expectTypeOf(qc).toEqualTypeOf<
    QueryResource<UserInfoQuery, UserInfoQueryVariables>
  >();
}

// Default (no TypeOverrides augmentation): the exported `useQuery` resolves to
// the Classic shape. This assertion runs at module load — no hook invocation,
// so it's safe to evaluate eagerly.
expectTypeOf(useQuery).toExtend<useQuery.Signatures.Classic>();

module('type | useQuery', function () {
  test('compiles (type-only)', function (assert) {
    assert.ok(_typeAssertions);
  });
});
