export {
  getClient,
  setClient,
  clearClient,
  clearClients
} from './-private/client';
export { gql } from '@apollo/client/core';
export { useQuery, useMutation, useSubscription } from './-private/usables';
export type {
  UseQuery,
  UseMutation,
  UseSubscription
} from './-private/usables';
export type {
  QueryOptions,
  QueryResource,
  QueryPositionalArgs
} from './-private/query';
export type {
  MutationOptions,
  MutationResource,
  MutationPositionalArgs
} from './-private/mutation';
export type {
  SubscriptionOptions,
  SubscriptionResource,
  SubscriptionPositionalArgs
} from './-private/subscription';
