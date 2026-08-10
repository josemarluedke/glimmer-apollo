import { module, test } from 'qunit';
import { useSubscription } from 'glimmer-apollo';
import type { SubscriptionResource } from 'glimmer-apollo';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  OnMessageAddedSubscription,
  OnMessageAddedSubscriptionVariables,
} from '../../../app/mocks/handlers';
import { expectTypeOf } from 'expect-type';

const ON_MESSAGE_ADDED = {} as TypedDocumentNode<
  OnMessageAddedSubscription,
  OnMessageAddedSubscriptionVariables
>;
const ctx = {};

function _typeAssertions() {
  // Infers TData and TVariables from TypedDocumentNode (no explicit generics).
  const s = useSubscription(ctx, () => [
    ON_MESSAGE_ADDED,
    { variables: { channel: 'general' } },
  ]);
  expectTypeOf(s).toEqualTypeOf<
    SubscriptionResource<
      OnMessageAddedSubscription,
      OnMessageAddedSubscriptionVariables
    >
  >();
  expectTypeOf(s.data).toEqualTypeOf<OnMessageAddedSubscription | undefined>();

  // Rejects structurally wrong variables.
  useSubscription(ctx, () => [
    ON_MESSAGE_ADDED,
    // @ts-expect-error - channel should be string, not number
    { variables: { channel: 123 } },
  ]);

  // Explicit generics still work.
  const se = useSubscription<
    OnMessageAddedSubscription,
    OnMessageAddedSubscriptionVariables
  >(ctx, () => [ON_MESSAGE_ADDED, { variables: { channel: 'general' } }]);
  expectTypeOf(se).toEqualTypeOf<
    SubscriptionResource<
      OnMessageAddedSubscription,
      OnMessageAddedSubscriptionVariables
    >
  >();
}

module('type | useSubscription', function () {
  test('compiles (type-only)', function (assert) {
    assert.ok(_typeAssertions);
  });
});
