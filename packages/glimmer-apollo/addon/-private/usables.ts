import { OperationVariables } from '@apollo/client/core';
import { createProxiedUsable } from './create-usable';
import { PositionalArgs, QueryResource } from './resources/query';

export function useQuery<TData = unknown, TVariables = OperationVariables>(
  parentDestroyable: unknown,
  args: () => PositionalArgs<TData, TVariables>
): QueryResource<TData, TVariables> {
  return createProxiedUsable<
    PositionalArgs<TData, TVariables>,
    QueryResource<TData, TVariables>
  >(QueryResource)(parentDestroyable, args);
}
