import { useResource } from './use-resource.ts';
import { type MutationPositionalArgs, MutationResource } from './mutation.ts';
import { type QueryPositionalArgs, QueryResource } from './query.ts';
import {
  type SubscriptionPositionalArgs,
  SubscriptionResource
} from './subscription.ts';
import type { OperationVariables } from '@apollo/client/core';

export function useQuery<
  TData = unknown,
  TVariables extends OperationVariables = OperationVariables
>(
  parentDestroyable: object,
  args: () => QueryPositionalArgs<TData, TVariables>
): QueryResource<TData, TVariables> {
  return useResource<
    QueryPositionalArgs<TData, TVariables>,
    QueryResource<TData, TVariables>
  >(parentDestroyable, QueryResource, args);
}

export function useMutation<
  TData = unknown,
  TVariables extends OperationVariables = OperationVariables
>(
  parentDestroyable: object,
  args: () => MutationPositionalArgs<TData, TVariables>
): MutationResource<TData, TVariables> {
  return useResource<
    MutationPositionalArgs<TData, TVariables>,
    MutationResource<TData, TVariables>
  >(parentDestroyable, MutationResource, args);
}

export function useSubscription<
  TData = unknown,
  TVariables extends OperationVariables = OperationVariables
>(
  parentDestroyable: object,
  args: () => SubscriptionPositionalArgs<TData, TVariables>
): SubscriptionResource<TData, TVariables> {
  return useResource<
    SubscriptionPositionalArgs<TData, TVariables>,
    SubscriptionResource<TData, TVariables>
  >(parentDestroyable, SubscriptionResource, args);
}

export type UseQuery<
  TData = unknown,
  TVariables extends OperationVariables = OperationVariables
> = {
  args: () => QueryPositionalArgs<TData, TVariables>[1];
  return: QueryResource<TData, TVariables>;
  data: TData;
  variables: TVariables;
};

export type UseMutation<
  TData = unknown,
  TVariables extends OperationVariables = OperationVariables
> = {
  args: () => MutationPositionalArgs<TData, TVariables>[1];
  return: MutationResource<TData, TVariables>;
  data: TData;
  variables: TVariables;
};

export type UseSubscription<
  TData = unknown,
  TVariables extends OperationVariables = OperationVariables
> = {
  args: () => SubscriptionPositionalArgs<TData, TVariables>[1];
  return: SubscriptionResource<TData, TVariables>;
  data: TData;
  variables: TVariables;
};
