import { module, test } from 'qunit';
import { useQuery } from 'glimmer-apollo';
import type { PartialQueryResource, QueryResource } from 'glimmer-apollo';
import type { DataValue, TypedDocumentNode } from '@apollo/client';
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

  // returnPartialData: data may miss fields.
  const qp = useQueryModern(ctx, () => [
    USER_INFO,
    { variables: { id: '1' }, returnPartialData: true },
  ]);
  expectTypeOf(qp).toEqualTypeOf<
    PartialQueryResource<UserInfoQuery, UserInfoQueryVariables>
  >();
  expectTypeOf(qp.data).toEqualTypeOf<
    DataValue.Partial<UserInfoQuery> | undefined
  >();
  if (qp.data?.user) {
    // @ts-expect-error - a field of partial data may be missing
    takesString(qp.data.user.firstName);
  }
  if (q.data?.user) {
    takesString(q.data.user.firstName);
  }

  const qcp = useQueryClassic<UserInfoQuery, UserInfoQueryVariables>(
    ctx,
    () => [USER_INFO, { variables: { id: '1' }, returnPartialData: true }]
  );
  expectTypeOf(qcp.data).toEqualTypeOf<
    DataValue.Partial<UserInfoQuery> | undefined
  >();

  // A boolean flag, not only the literal true, selects the partial shape.
  const flag = Boolean(ctx);
  const qf = useQueryModern(ctx, () => [
    USER_INFO,
    { variables: { id: '1' }, returnPartialData: flag },
  ]);
  expectTypeOf(qf.data).toEqualTypeOf<
    DataValue.Partial<UserInfoQuery> | undefined
  >();

  // onComplete receives the same partial shape as data.
  useQueryModern(ctx, () => [
    USER_INFO,
    {
      variables: { id: '1' },
      returnPartialData: true,
      onComplete: (data) => {
        expectTypeOf(data).toEqualTypeOf<
          DataValue.Partial<UserInfoQuery> | undefined
        >();
      },
    },
  ]);

  // A complete resource fits where a partial one is expected, not the reverse.
  expectTypeOf(q).toExtend<
    PartialQueryResource<UserInfoQuery, UserInfoQueryVariables>
  >();
  expectTypeOf(qp).not.toExtend<
    QueryResource<UserInfoQuery, UserInfoQueryVariables>
  >();
}

function takesString(value: string) {
  return value;
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
