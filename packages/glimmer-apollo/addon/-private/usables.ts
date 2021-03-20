import { OperationVariables } from '@apollo/client/core';
import { createProxiedUsable } from './create-usable';
import { MutationResource } from './mutation';
import { PositionalArgs, QueryResource } from './query';

export function useQuery<TData = unknown, TVariables = OperationVariables>(
  parentDestroyable: unknown,
  args: () => PositionalArgs<TData, TVariables>
): QueryResource<TData, TVariables> {
  return createProxiedUsable<
    PositionalArgs<TData, TVariables>,
    QueryResource<TData, TVariables>
  >(QueryResource)(parentDestroyable, args);
}

export function useMutation<TData = unknown, TVariables = OperationVariables>(
  parentDestroyable: unknown,
  args: () => PositionalArgs<TData, TVariables>
): MutationResource<TData, TVariables> {
  return createProxiedUsable<
    PositionalArgs<TData, TVariables>,
    MutationResource<TData, TVariables>
  >(MutationResource)(parentDestroyable, args);
}
