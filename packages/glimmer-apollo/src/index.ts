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

export { useResource } from './-private/use-resource';
export {
  QueryOptions,
  QueryResource,
  QueryPositionalArgs
} from './-private/query';
export {
  MutationOptions,
  MutationResource,
  MutationPositionalArgs
} from './-private/mutation';
