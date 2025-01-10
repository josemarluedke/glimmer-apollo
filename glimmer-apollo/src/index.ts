export {
  getClient,
  setClient,
  clearClient,
  clearClients
} from './-private/client.ts';
export { gql } from '@apollo/client/core';
export { useQuery, useMutation, useSubscription } from './-private/usables.ts';
export type {
  UseQuery,
  UseMutation,
  UseSubscription
} from './-private/usables.ts';
export type {
  QueryOptions,
  QueryResource,
  QueryPositionalArgs
} from './-private/query.ts';
export type {
  MutationOptions,
  MutationResource,
  MutationPositionalArgs
} from './-private/mutation.ts';
export type {
  SubscriptionOptions,
  SubscriptionResource,
  SubscriptionPositionalArgs
} from './-private/subscription.ts';
