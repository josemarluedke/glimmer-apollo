import { useResource } from './use-resource';
import { MutationPositionalArgs, MutationResource } from './mutation';
import { QueryPositionalArgs, QueryResource } from './query';
import {
  SubscriptionPositionalArgs,
  SubscriptionResource
} from './subscription';
import type { OperationVariables } from '@apollo/client/core';

export function useQuery<TData = unknown, TVariables = OperationVariables>(
  parentDestroyable: object,
  args: () => QueryPositionalArgs<TData, TVariables>
): QueryResource<TData, TVariables> {
  return useResource<
    QueryPositionalArgs<TData, TVariables>,
    QueryResource<TData, TVariables>
  >(parentDestroyable, QueryResource, args);
}

export function useMutation<TData = unknown, TVariables = OperationVariables>(
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
  TVariables = OperationVariables
>(
  parentDestroyable: object,
  args: () => SubscriptionPositionalArgs<TData, TVariables>
): SubscriptionResource<TData, TVariables> {
  return useResource<
    SubscriptionPositionalArgs<TData, TVariables>,
    SubscriptionResource<TData, TVariables>
  >(parentDestroyable, SubscriptionResource, args);
}

export type UseQuery<TData = unknown, TVariables = OperationVariables> = {
  args: () => QueryPositionalArgs<TData, TVariables>[1];
  return: QueryResource<TData, TVariables>;
  data: TData;
  variables: TVariables;
};

export type UseMutation<TData = unknown, TVariables = OperationVariables> = {
  args: () => MutationPositionalArgs<TData, TVariables>[1];
  return: MutationResource<TData, TVariables>;
  data: TData;
  variables: TVariables;
};

export type UseSubscription<TData = unknown, TVariables = OperationVariables> =
  {
    args: () => SubscriptionPositionalArgs<TData, TVariables>[1];
    return: SubscriptionResource<TData, TVariables>;
    data: TData;
    variables: TVariables;
  };
