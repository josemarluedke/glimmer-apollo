import { OperationVariables } from '@apollo/client/core';
import { useResource } from './use-resource';
import { MutationPositionalArgs, MutationResource } from './mutation';
import { QueryPositionalArgs, QueryResource } from './query';

export function useQuery<TData = unknown, TVariables = OperationVariables>(
  parentDestroyable: unknown,
  args: () => QueryPositionalArgs<TData, TVariables>
): QueryResource<TData, TVariables> {
  return useResource<
    QueryPositionalArgs<TData, TVariables>,
    QueryResource<TData, TVariables>
  >(parentDestroyable, QueryResource, args);
}

export function useMutation<TData = unknown, TVariables = OperationVariables>(
  parentDestroyable: unknown,
  args: () => MutationPositionalArgs<TData, TVariables>
): MutationResource<TData, TVariables> {
  return useResource<
    MutationPositionalArgs<TData, TVariables>,
    MutationResource<TData, TVariables>
  >(parentDestroyable, MutationResource, args);
}
